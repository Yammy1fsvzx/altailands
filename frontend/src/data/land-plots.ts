import { LandPlot } from '@/types/land-plot'

const PLOT_IMAGES = {
  plot1: [
    'https://avatars.mds.yandex.net/get-ydo/4393845/2a0000017d47ef49788e3498c06ca3456c4a/diploma',
    'https://s0.rbk.ru/v6_top_pics/media/img/4/90/756070017860904.jpg',
    'https://img.dmclk.ru/vitrina/owner/2e/d8/2ed8f7ccb7c04129b533143f428cdb45.jpg'
  ],
  plot2: [
    'https://s0.rbk.ru/v6_top_pics/media/img/4/90/756070017860904.jpg',
    'https://img.dmclk.ru/vitrina/owner/70/42/7042c6bb796148ffb996c464b4e567cb.jpg',
    'https://img.dmclk.ru/vitrina/owner/2e/d8/2ed8f7ccb7c04129b533143f428cdb45.jpg'
  ],
  plot3: [
    'https://img.dmclk.ru/vitrina/owner/2e/d8/2ed8f7ccb7c04129b533143f428cdb45.jpg',
    'https://img.dmclk.ru/vitrina/owner/70/42/7042c6bb796148ffb996c464b4e567cb.jpg',
    'https://avatars.mds.yandex.net/get-ydo/4393845/2a0000017d47ef49788e3498c06ca3456c4a/diploma'
  ]
}

export const landPlots: LandPlot[] = [
  {
    id: '1',
    title: 'Участок в Чемальском районе',
    description: 'Великолепный участок в окружении гор с видом на реку Катунь. Идеально подходит для строительства дома или гостевых домиков. Экологически чистый район, развивающаяся инфраструктура, круглогодичный доступ.',
    cadastralNumber: '22:63:050116:496',
    area: 15,
    specifiedArea: 15.2,
    price: 2800000,
    pricePerSotka: 186667,
    location: 'chemal',
    region: 'Республика Алтай',
    imageUrl: PLOT_IMAGES.plot1[0],
    images: PLOT_IMAGES.plot1,
    landCategory: 'Земли населенных пунктов',
    permittedUse: 'Для индивидуального жилищного строительства',
    features: [
      'Живописный вид на горы',
      'Рядом река Катунь',
      'Круглогодичный подъезд',
      'Рядом лес',
      'Развивающийся район'
    ],
    terrain: {
      isNearRiver: true,
      isNearMountains: true,
      isNearForest: true,
      isNearLake: false,
      hasViewOnMountains: true,
      landscape: 'slope',
      elevation: 450
    },
    communications: [
      'Электричество 15 кВт',
      'Водозаборная скважина',
      'Септик',
      'Газ в перспективе'
    ],
    documents: [
      'Свидетельство о собственности',
      'Кадастровый паспорт',
      'Межевой план',
      'ГПЗУ'
    ],
    category: 'ИЖС',
    status: 'available',
    coordinates: {
      lat: 51.4108,
      lng: 86.0021
    }
  },
  {
    id: '2',
    title: 'Видовой участок в Майминском районе',
    description: 'Просторный участок с панорамным видом на горы. Отличная возможность для инвестиций или строительства собственного дома. Прекрасная транспортная доступность, развитая инфраструктура поселка.',
    cadastralNumber: '04:01:010203:5678',
    area: 12,
    specifiedArea: 12.1,
    price: 3200000,
    pricePerSotka: 266667,
    location: 'maima',
    region: 'Республика Алтай',
    imageUrl: PLOT_IMAGES.plot2[0],
    images: PLOT_IMAGES.plot2,
    landCategory: 'Земли населенных пунктов',
    permittedUse: 'Для индивидуального жилищного строительства',
    features: [
      'Панорамный вид',
      'Ровный рельеф',
      'Благоустроенная территория',
      'Городская инфраструктура',
      'Удобная транспортная доступность'
    ],
    terrain: {
      isNearRiver: false,
      isNearMountains: true,
      isNearForest: true,
      isNearLake: false,
      hasViewOnMountains: true,
      landscape: 'flat',
      elevation: 380
    },
    communications: [
      'Электричество 15 кВт',
      'Центральный водопровод',
      'Газ по границе',
      'Канализация центральная'
    ],
    documents: [
      'Свидетельство о собственности',
      'Кадастровый паспорт',
      'Градостроительный план'
    ],
    category: 'ИЖС',
    status: 'reserved',
    coordinates: {
      lat: 52.0147,
      lng: 85.9015
    }
  },
  {
    id: '3',
    title: 'Участок в районе Белокурихи',
    description: 'Уютный участок в экологически чистом районе. Высокий уровень безопасности, качественные дороги, продуманная инфраструктура. Идеальное место для постоянного проживания.',
    cadastralNumber: '22:64:013901:9012',
    area: 10,
    specifiedArea: 10.05,
    price: 3500000,
    pricePerSotka: 350000,
    location: 'belokurikha',
    region: 'Алтайский край',
    imageUrl: PLOT_IMAGES.plot3[0],
    images: PLOT_IMAGES.plot3,
    landCategory: 'Земли населенных пунктов',
    permittedUse: 'Для индивидуального жилищного строительства',
    features: [
      'Престижный район',
      'Качественные дороги',
      'Современное освещение',
      'Детская площадка',
      'Административное здание'
    ],
    terrain: {
      isNearRiver: false,
      isNearMountains: true,
      isNearForest: false,
      isNearLake: true,
      hasViewOnMountains: true,
      landscape: 'hill',
      elevation: 520
    },
    communications: [
      'Электричество 15 кВт',
      'Газ магистральный',
      'Водопровод центральный',
      'Канализация центральная'
    ],
    documents: [
      'Свидетельство о собственности',
      'Кадастровый паспорт',
      'Межевой план'
    ],
    category: 'ИЖС',
    status: 'available',
    coordinates: {
      lat: 51.9960,
      lng: 84.9840
    }
  }
] 