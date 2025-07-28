const CACHE_NAME = 'class-activities-pwa-v1.0.0';
const OFFLINE_URL = './offline.html';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  './',
  './index.html',
  './main.html',
  './student-management.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/media/images/school-logo.png',
  
  // الأنشطة الأساسية
  './activities/timer.html',
  './activities/quiz.html',
  './activities/random.html',
  './activities/vote.html',
  './activities/whois.html',
  './activities/challenges.html',
  './activities/knowledge-race.html',
  './activities/Blockbusters.html',
  './activities/bomb-timer.html',
  './activities/create-story.html',
  './activities/kingdoms-center.html',
  './activities/lightning-kingdom.html',
  './activities/wisdom-kingdom.html',
  './activities/matrah-market.html',
  './activities/monopoly-oman.html',
  './activities/nizwa-school.html',
  './activities/challenges-ultimate.html',
  
  // الملفات الصوتية الأساسية
  './assets/media/sounds/click.mp3',
  './assets/media/sounds/clap.mp3',
  './assets/media/sounds/win.mp3',
  './assets/media/sounds/startapp.mp3',
  './assets/media/sounds/start-timer.mp3',
  './assets/media/sounds/end-timer.mp3',
  './assets/media/sounds/countdown-beep.mp3',
  
  // ملفات البيانات
  './config/school.json',
  './config/settings.json',
  './config/users.json',
  './data/schedule.json',
  './data/studentData.json',
  
  // الخطوط (من Google Fonts)
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('Service Worker: Caching static assets');
        
        // تخزين الملفات الأساسية
        await cache.addAll(STATIC_ASSETS);
        
        // إنشاء صفحة أوفلاين
        await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
        
        console.log('Service Worker: All assets cached successfully');
      } catch (error) {
        console.error('Service Worker: Failed to cache assets:', error);
      }
    })()
  );
  
  // فرض تنشيط Service Worker الجديد فوراً
  self.skipWaiting();
});

// تنشيط Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    (async () => {
      // حذف الذاكرة المؤقتة القديمة
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map(cacheKey => {
          if (cacheKey !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheKey);
            return caches.delete(cacheKey);
          }
        })
      );
      
      // السيطرة على جميع العملاء
      self.clients.claim();
      console.log('Service Worker: Activated successfully');
    })()
  );
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:'))) {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // البحث في الذاكرة المؤقتة أولاً
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // محاولة الحصول على الملف من الشبكة
        const response = await fetch(event.request);
        
        // التحقق من صحة الاستجابة
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // تخزين الملف الجديد في الذاكرة المؤقتة
        const responseToCache = response.clone();
        const cache = await caches.open(CACHE_NAME);
        
        // تخزين الملفات التفاعلية والصوتية
        if (event.request.url.includes('.html') || 
            event.request.url.includes('.css') || 
            event.request.url.includes('.js') ||
            event.request.url.includes('.mp3') ||
            event.request.url.includes('.png') ||
            event.request.url.includes('.jpg') ||
            event.request.url.includes('.json')) {
          cache.put(event.request, responseToCache);
        }
        
        return response;
        
      } catch (error) {
        console.log('Service Worker: Fetch failed, serving offline page:', error);
        
        // إرجاع صفحة أوفلاين للملفات HTML
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        
        // إرجاع استجابة فارغة للموارد الأخرى
        return new Response('', {
          status: 408,
          statusText: 'Offline'
        });
      }
    })()
  );
});

// معالجة الرسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ACTIVITY') {
    // تخزين نشاط معين في الذاكرة المؤقتة
    caches.open(CACHE_NAME).then(cache => {
      cache.add(event.data.url);
    });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    // إرسال حجم الذاكرة المؤقتة
    caches.open(CACHE_NAME).then(async cache => {
      const keys = await cache.keys();
      event.ports[0].postMessage({
        type: 'CACHE_SIZE',
        size: keys.length
      });
    });
  }
});

// معالجة إشعارات الدفع (للاستخدام المستقبلي)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'إشعار جديد من برنامج الأنشطة الصفية',
      icon: './assets/media/images/school-logo.png',
      badge: './assets/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1'
      },
      actions: [
        {
          action: 'explore',
          title: 'عرض التفاصيل',
          icon: './assets/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'إغلاق',
          icon: './assets/icons/icon-96x96.png'
        }
      ],
      requireInteraction: true,
      tag: 'class-activity-notification'
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'الأنشطة الصفية', options)
    );
  }
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // فتح التطبيق
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'close') {
    // إغلاق الإشعار فقط
    event.notification.close();
  } else {
    // النقر على الإشعار نفسه
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// معالجة أحداث المزامنة في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // إجراء مزامنة البيانات في الخلفية
      syncData()
    );
  }
});

// دالة مزامنة البيانات
async function syncData() {
  try {
    // مزامنة بيانات الطلاب
    const studentData = await fetch('./data/studentData.json');
    if (studentData.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('./data/studentData.json', studentData.clone());
    }
    
    // مزامنة إعدادات المدرسة
    const schoolConfig = await fetch('./config/school.json');
    if (schoolConfig.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('./config/school.json', schoolConfig.clone());
    }
    
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}
