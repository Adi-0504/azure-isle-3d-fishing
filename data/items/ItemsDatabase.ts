import { SupportedLanguage } from '../localization/i18n';

export type ItemType = 'rod' | 'bait' | 'upgrade' | 'blueprint' | 'decor' | 'creature';

export interface ItemData {
  id: string;
  names: Record<SupportedLanguage, string>;
  type: ItemType;
  price: number; // buy price; creatures sell for their basePrice
  description: Record<SupportedLanguage, string>;
  tier?: number;
  bonus?: number;
  icon: string; // SVG identifier or emoji
}

export const ITEMS_DATABASE: Record<string, ItemData> = {
  // --- RODS ---
  'rod_basic': {
    id: 'rod_basic',
    names: {
      'zh-TW': '竹製手作釣竿',
      'zh-CN': '竹制手作钓竿',
      'en': 'Bamboo Fishing Rod',
      'ja': '竹の手作り釣り竿',
      'ko': '대나무 수제 낚싯대',
      'es': 'Caña Básica de Bambú',
      'fr': 'Canne en Bambou Simple',
      'de': 'Einfache Bambusangel'
    },
    type: 'rod',
    price: 0,
    tier: 1,
    bonus: 1.0,
    icon: 'rod',
    description: {
      'zh-TW': '以島上竹子削製而成的初學者釣竿，雖質樸但能釣起淺灘小魚與甲殼生物。',
      'zh-CN': '以岛上竹子削制而成的初学者钓竿，虽质朴但能钓起浅滩小鱼与甲壳生物。',
      'en': 'A rustic starter rod crafted from island bamboo. Good for shallow water catches.',
      'ja': '島の竹を削り出して作った素朴な初心者用の釣り竿。',
      'ko': '섬의 대나무로 깎아 만든 기본 낚싯대로, 얕은 물가의 물고기를 낚을 수 있습니다.',
      'es': 'Caña rústica de bambú isleño. Adecuada para capturas en aguas poco profundas.',
      'fr': 'Une canne rudimentaire taillée dans le bambou de l\'île.',
      'de': 'Eine einfache Angel aus Inselbambus. Gut für Uferfänge.'
    }
  },
  'rod_carbon': {
    id: 'rod_carbon',
    names: {
      'zh-TW': '碳纖維靈動釣竿',
      'zh-CN': '碳纤维灵动钓竿',
      'en': 'Carbon Fiber Rod',
      'ja': 'カーボン軽量釣り竿',
      'ko': '카본 피싱 로드',
      'es': 'Caña de Fibra de Carbono',
      'fr': 'Canne en Carbone Agile',
      'de': 'Karbonfaser-Angel'
    },
    type: 'rod',
    price: 200,
    tier: 2,
    bonus: 1.3,
    icon: 'rod',
    description: {
      'zh-TW': '輕量化高彈性碳纖維打造，咬鉤反應更快，可挑戰中型與深水生物。',
      'zh-CN': '轻量化高弹性碳纤维打造，咬钩反应更快，可挑战中型与深水生物。',
      'en': 'Lightweight and resilient carbon weave. Faster nibble cues and unlocks tier 2 species.',
      'ja': 'しなやかで軽量なカーボン素材。アタリの察知が早く、中型の魚に対応。',
      'ko': '가볍고 탄성이 우수한 카본 낚싯대로, 중형 어종을 수월하게 공략할 수 있습니다.',
      'es': 'Construcción ligera de carbono. Respuesta más rápida para especies de nivel 2.',
      'fr': 'Légère et souple en fibre de carbone. Détecte les touches plus rapidement.',
      'de': 'Leichte und elastische Kohlefaser. Schnellere Bisse und für Stufe-2-Arten.'
    }
  },
  'rod_pro': {
    id: 'rod_pro',
    names: {
      'zh-TW': '專業獵手海釣竿',
      'zh-CN': '专业猎手海钓竿',
      'en': 'Pro Angler Rod',
      'ja': 'プロハンター磯竿',
      'ko': '프로 앵글러 씨 로드',
      'es': 'Caña Profesional Marítima',
      'fr': 'Canne de Pêche Pro',
      'de': 'Profi-Meeresangel'
    },
    type: 'rod',
    price: 600,
    tier: 3,
    bonus: 1.6,
    icon: 'rod',
    description: {
      'zh-TW': '具備強韌耐鹽蝕金屬導環與高拉力腰身，能征服外海礁岩的狂暴巨魚。',
      'zh-CN': '具备强韧耐盐蚀金属导环与高拉力腰身，能征服外海礁岩的狂暴巨鱼。',
      'en': 'Reinforced marine guides and heavy backbone engineered for reef giants like Azure Tuna.',
      'ja': '塩害に強いガイドと強靭なバットパワー。磯場の大物と渡り合える。',
      'ko': '내구성이 강화된 대구경 가이드와 강력한 허리힘으로 대형 어종을 제압합니다.',
      'es': 'Guías resistentes a la corrosión marina capaces de domar a los gigantes de arrecife.',
      'fr': 'Renforcée pour les combats intenses contre les grands prédateurs marins.',
      'de': 'Verstärkte Ringe und hohes Rückgrat für kapitale Fische an den Klippen.'
    }
  },
  'rod_master': {
    id: 'rod_master',
    names: {
      'zh-TW': '蔚藍大師黃金神竿',
      'zh-CN': '蔚蓝大师黄金神竿',
      'en': 'Master Golden Rod',
      'ja': 'マスター・ゴールドロッド',
      'ko': '마스터 골든 로드',
      'es': 'Caña Dorada de Maestro',
      'fr': 'Canne Dorée du Maître',
      'de': 'Meister-Goldangel'
    },
    type: 'rod',
    price: 1500,
    tier: 4,
    bonus: 2.0,
    icon: 'rod',
    description: {
      'zh-TW': '島嶼工匠淬鍊的傳奇金箔釣竿，散發微光，極大提高所有稀有傳說生物的上鉤率！',
      'zh-CN': '岛屿工匠淬炼的传奇金箔钓竿，散发微光，极大提高所有稀有传说生物的上钩率！',
      'en': 'A gleaming legendary rod forged by master island artisans. Greatly boosts rare encounters!',
      'ja': '至高の職人が黄金の輝きを宿した伝説の竿。幻の生物を引き寄せる。',
      'ko': '전설적인 황금 광택의 명품 낚싯대로, 희귀 생물의 출현율을 대폭 상승시킵니다.',
      'es': 'Una caña legendaria bañada en oro que atrae a las criaturas más esquivas del océano.',
      'fr': 'Une canne dorée d\'exception attirant les espèces aquatiques les plus rares.',
      'de': 'Eine funkelnde Meisterangel, die selbst die seltensten Insellegenden anlockt.'
    }
  },

  // --- BAIT ---
  'bait_worm': {
    id: 'bait_worm',
    names: {
      'zh-TW': '肥沃紅蚯蚓',
      'zh-CN': '肥沃红蚯蚓',
      'en': 'Garden Earthworm',
      'ja': 'ミミズエサ',
      'ko': '붉은 지렁이',
      'es': 'Lombriz de Tierra',
      'fr': 'Ver de Terre',
      'de': 'Gartenwurm'
    },
    type: 'bait',
    price: 5,
    bonus: 1.25,
    icon: 'worm',
    description: {
      'zh-TW': '肥美多汁的天然土壤紅蚯蚓，能縮短 25% 咬鉤等待時間。',
      'zh-CN': '肥美多汁的天然土壤红蚯蚓，能缩短 25% 咬钩等待时间。',
      'en': 'Juicy common worm. Reduces waiting time for bites by 25%.',
      'ja': '活きの良い天然ミミズ。アタリまでの時間を25%短縮。',
      'ko': '싱싱한 지렁이 미끼로, 입질 대기 시간을 25% 단축시켜 줍니다.',
      'es': 'Cebo natural jugoso. Reduce el tiempo de espera de picada un 25%.',
      'fr': 'Ver classique très attractif réduisant le temps d\'attente de 25%.',
      'de': 'Saftiger Regenwurm. Verkürzt die Wartezeit auf Bisse um 25%.'
    }
  },
  'bait_glow': {
    id: 'bait_glow',
    names: {
      'zh-TW': '夜光螢火魚餌',
      'zh-CN': '夜光萤火鱼饵',
      'en': 'Luminous Glow Bait',
      'ja': '夜光ルミナスベイト',
      'ko': '야광 루미너스 미끼',
      'es': 'Cebo Luminoso',
      'fr': 'Appât Phosphorescent',
      'de': 'Leuchtköder'
    },
    type: 'bait',
    price: 18,
    bonus: 1.5,
    icon: 'glow',
    description: {
      'zh-TW': '混入螢光藻類的特殊餌料，在夜間與陰雨深水中格外誘人，咬鉤率 +50%。',
      'zh-CN': '混入荧光藻类的特殊饵料，在夜间与阴雨深水中格外诱人，咬钩率 +50%。',
      'en': 'Infused with bioluminescent plankton. +50% bite rate, excels at night & rain.',
      'ja': '発光プランクトンを練り込んだエサ。夜間や雨の釣りに絶大な効果。',
      'ko': '발광 플랑크톤이 함유되어 야간 및 우천 시 탁월한 유인 효과를 냅니다.',
      'es': 'Impregnado con plancton fosforescente. Excelente para la pesca nocturna y lluviosa.',
      'fr': 'Brille dans l\'obscurité des eaux profondes pour séduire les créatures nocturnes.',
      'de': 'Mit Leuchtplankton versetzt. Glänzt besonders nachts und bei Regenwetter.'
    }
  },
  'bait_master': {
    id: 'bait_master',
    names: {
      'zh-TW': '秘製香濃誘魚團',
      'zh-CN': '秘制香浓诱鱼团',
      'en': 'Master Aroma Chum',
      'ja': '秘伝アロマ特製コマセ',
      'ko': '특제 마스터 떡밥',
      'es': 'Engodo Maestro Aromático',
      'fr': 'Appât Suprême Aromatique',
      'de': 'Meister-Aromaköder'
    },
    type: 'bait',
    price: 45,
    bonus: 2.0,
    icon: 'shrimp',
    description: {
      'zh-TW': '加入濃縮蝦膏與香料的奢華魚餌，能大幅吸引稀有星級生物靠近！',
      'zh-CN': '加入浓缩虾膏与香料的奢华鱼饵，能大幅吸引稀有星级生物靠近！',
      'en': 'Concentrated shrimp essence and herbs. Drastically increases high-rarity spawns!',
      'ja': '濃厚なエビエキスを凝縮した贅沢な練りエサ。高レア生物を誘引する。',
      'ko': '새우 농축 진액과 향료를 배합하여 고등급 희귀 생물을 강하게 끌어당깁니다.',
      'es': 'Esencia concentrada de marisco. Atrae con facilidad a las presas más valiosas.',
      'fr': 'Concentré d\'effluves marins qui attire irrésistiblement les espèces légendaires.',
      'de': 'Konzentrierte Garnelenessenz für höchste Lockwirkung auf seltene Trophäen.'
    }
  },

  // --- UPGRADES & BUILDING ---
  'bag_upgrade_1': {
    id: 'bag_upgrade_1',
    names: {
      'zh-TW': '休閒行囊擴充包 (20格)',
      'zh-CN': '休闲行囊扩充包 (20格)',
      'en': 'Backpack Upgrade I (20 slots)',
      'ja': 'リュック拡張パックI (20枠)',
      'ko': '배낭 확장 파우치 I (20칸)',
      'es': 'Mochila Ampliada I (20 ranuras)',
      'fr': 'Extension de Sac I (20 fentes)',
      'de': 'Rucksackerweiterung I (20 Fächer)'
    },
    type: 'upgrade',
    price: 180,
    icon: 'bag',
    description: {
      'zh-TW': '將背包容量從初始 12 格擴充至 20 格，容納更多魚類與物資。',
      'zh-CN': '将背包容量从初始 12 格扩充至 20 格，容纳更多鱼类与物资。',
      'en': 'Expands backpack from 12 to 20 slots to carry more fish and supplies.',
      'ja': 'リュックの所持上限を12枠から20枠に拡張する。',
      'ko': '가방 소지 용량을 기본 12칸에서 20칸으로 늘려줍니다.',
      'es': 'Aumenta la capacidad de la mochila de 12 a 20 ranuras.',
      'fr': 'Porte la capacité du sac de 12 à 20 emplacements.',
      'de': 'Erweitert den Rucksack von 12 auf 20 Fächer.'
    }
  },
  'bag_upgrade_2': {
    id: 'bag_upgrade_2',
    names: {
      'zh-TW': '探險家豪華登山包 (30格)',
      'zh-CN': '探险家豪华登山包 (30格)',
      'en': 'Backpack Upgrade II (30 slots)',
      'ja': 'リュック拡張パックII (30枠)',
      'ko': '배낭 확장 파우치 II (30칸)',
      'es': 'Mochila de Expedición II (30 ranuras)',
      'fr': 'Extension de Sac II (30 fentes)',
      'de': 'Rucksackerweiterung II (30 Fächer)'
    },
    type: 'upgrade',
    price: 450,
    icon: 'bag',
    description: {
      'zh-TW': '將背包容量進一步升級至 30 格，長途釣魚探險毫無後顧之憂。',
      'zh-CN': '将背包容量进一步升级至 30 格，长途钓鱼探险毫无后顾之忧。',
      'en': 'Upgrades capacity to 30 slots for extended expeditions without clutter.',
      'ja': '所持上限を30枠へ拡張。長期の遠征でも安心の大容量。',
      'ko': '가방 소지 용량을 30칸으로 극대화하여 쾌적한 탐험을 제공합니다.',
      'es': 'Mejora a 30 ranuras para largas jornadas de pesca.',
      'fr': 'Offre un confort total avec 30 fentes de stockage.',
      'de': 'Erhöht die Kapazität auf 30 Fächer für maximale Sammelfreude.'
    }
  },
  'cabin_blueprint': {
    id: 'cabin_blueprint',
    names: {
      'zh-TW': '森林原木小屋營造執照',
      'zh-CN': '森林原木小屋营造执照',
      'en': 'Log Cabin Blueprint',
      'ja': 'ログハウス建築許可証',
      'ko': '통나무 오두막 건축 허가서',
      'es': 'Plano de Cabaña de Troncos',
      'fr': 'Permis de Chalet en Bois',
      'de': 'Blockhütten-Bauplan'
    },
    type: 'blueprint',
    price: 300,
    icon: 'home',
    description: {
      'zh-TW': '在營地搭建第一座溫暖的木質小屋，告別單薄帳篷，解鎖個人水族箱空間！',
      'zh-CN': '在营地搭建第一座温暖的木质小屋，告别单薄帐篷，解锁个人水族箱空间！',
      'en': 'Replaces starter tent with a cozy wooden log cabin and unlocks personal aquarium placement!',
      'ja': 'テントから温かみのある木の小屋へと住まいをステップアップ。個人水槽の設置が可能に。',
      'ko': '텐트를 아늑한 원목 오두막으로 교체하고 개인 수조 설치 공간을 확보합니다.',
      'es': 'Sustituye la tienda inicial por una cabaña acogedora y permite instalar un acuario casero.',
      'fr': 'Remplace la tente de départ par un charmant chalet avec espace pour aquarium privé.',
      'de': 'Ersetzt das Zelt durch eine gemütliche Blockhütte und schaltet das Heim-Aquarium frei.'
    }
  },
  'cabin_extension': {
    id: 'cabin_extension',
    names: {
      'zh-TW': '木屋陽台與庭院擴建案',
      'zh-CN': '木屋阳台与庭院扩建案',
      'en': 'Cabin Veranda & Garden Extension',
      'ja': 'テラス＆ガーデン増築プラン',
      'ko': '오두막 테라스 및 정원 증축',
      'es': 'Ampliación de Porche y Jardín',
      'fr': 'Extension Terrasse & Jardin',
      'de': 'Veranda & Gartenerweiterung'
    },
    type: 'blueprint',
    price: 750,
    icon: 'flower',
    description: {
      'zh-TW': '為小屋增設木質觀景露台、屋簷風鈴與鮮花庭院，外觀更加精緻舒適。',
      'zh-CN': '为小屋增设木质观景露台、屋檐风铃与鲜花庭院，外观更加精致舒适。',
      'en': 'Adds scenic wooden veranda, floral planters, and refined architectural styling.',
      'ja': '小屋に広々としたウッドデッキと花壇を追加し、リゾート風の佇まいに。',
      'ko': '오두막에 넓은 목조 테라스와 꽃 화단을 증축하여 멋진 경관을 연출합니다.',
      'es': 'Añade un porche escénico, jardineras y un aspecto arquitectónico premium.',
      'fr': 'Ajoute une terrasse panoramique et des parterres de fleurs au chalet.',
      'de': 'Erweitert die Hütte um eine Aussichtsveranda und bunte Blumenrabatten.'
    }
  },
  'home_aquarium': {
    id: 'home_aquarium',
    names: {
      'zh-TW': '客廳水晶觀賞水族箱',
      'zh-CN': '客厅水晶观赏水族箱',
      'en': 'Living Room Glass Aquarium',
      'ja': 'リビング硝子アクアリウム',
      'ko': '거실 크리스탈 유리 수족관',
      'es': 'Acuario de Cristal Doméstico',
      'fr': 'Aquarium de Salon en Verre',
      'de': 'Wohnzimmer-Glasaquarium'
    },
    type: 'blueprint',
    price: 220,
    icon: 'aquarium',
    description: {
      'zh-TW': '裝備於木屋中的清澈玻璃水箱，配備氧氣泵與柔和射燈，可放入喜愛的魚類游泳。',
      'zh-CN': '装备于木屋中的清澈玻璃水箱，配备氧气泵与柔和射灯，可放入喜爱的鱼类游泳。',
      'en': 'Clear glass tank with filtration bubbles and ambient lighting for displaying your prized fish.',
      'ja': 'エアレーション泡とLEDライトを備えた鑑賞用水槽。自慢の魚を泳がせよう。',
      'ko': '기포 여과기와 조명이 장착된 수조로, 잡은 물고기를 실시간으로 감상할 수 있습니다.',
      'es': 'Tanque de cristal con burbujas y luz ambiente para admirar tus mejores capturas.',
      'fr': 'Cuve transparente avec bulles et éclairage pour admirer vos poissons chez vous.',
      'de': 'Glasklares Aquarium mit Filterbläschen und sanfter Beleuchtung für deine Fänge.'
    }
  },
  'museum_tier_1': {
    id: 'museum_tier_1',
    names: {
      'zh-TW': '公立水族館：淡海生態展區 (Tier 1)',
      'zh-CN': '公立水族馆：淡海生态展区 (Tier 1)',
      'en': 'Museum Aquarium: Freshwater & Coast (Tier 1)',
      'ja': '公立水族館：淡水＆沿岸展示区 (Tier 1)',
      'ko': '공립 수족관: 담수 및 연안 전시관 (Tier 1)',
      'es': 'Acuario Público: Agua Dulce y Costa (Nivel 1)',
      'fr': 'Aquarium Public : Rivières & Côtes (Palier 1)',
      'de': 'Schauaquarium: Süßwasser & Küste (Stufe 1)'
    },
    type: 'blueprint',
    price: 350,
    icon: 'museum',
    description: {
      'zh-TW': '資助島嶼博物館落成第一批展示水槽，供全島居民與遊客欣賞溪流與沙灘生物。純展示無營利。',
      'zh-CN': '资助岛屿博物馆落成第一批展示水槽，供全岛居民与游客欣赏溪流与沙滩生物。纯展示无营利。',
      'en': 'Fund initial museum exhibition tanks for river and beach species. Pure display without passive income.',
      'ja': '博物館の初期展示水槽を整備。川や砂浜の生き物を展示寄贈できる。(非営利純鑑賞)',
      'ko': '박물관의 1단계 수조를 기증받아 전시관을 개관합니다. 순수 보존 및 감상용 시설입니다.',
      'es': 'Financia las primeras vitrinas del museo para especies de río y playa (sin lucro).',
      'fr': 'Finance les premiers bassins du musée insulaire (exposition pure sans rente passive).',
      'de': 'Finanziert erste Museumstanks für Fluss- und Strandarten (reine Ausstellung ohne Einnahmen).'
    }
  },
  'museum_tier_2': {
    id: 'museum_tier_2',
    names: {
      'zh-TW': '公立水族館：礁岩潮池棲地展 (Tier 2)',
      'zh-CN': '公立水族馆：礁岩潮池栖地展 (Tier 2)',
      'en': 'Museum Aquarium: Coral Reef Habitats (Tier 2)',
      'ja': '公立水族館：サンゴ礁＆潮だまり生態区 (Tier 2)',
      'ko': '공립 수족관: 산호초 및 암초 생태관 (Tier 2)',
      'es': 'Acuario Público: Hábitats Arrecifales (Nivel 2)',
      'fr': 'Aquarium Public : Récifs Coralliens (Palier 2)',
      'de': 'Schauaquarium: Riff-Habitate (Stufe 2)'
    },
    type: 'blueprint',
    price: 800,
    icon: 'museum',
    description: {
      'zh-TW': '擴建潮間帶岩石潮池與活體珊瑚造景展廳，生動展示蝦蟹甲殼類的生活習性。',
      'zh-CN': '扩建潮间带岩石潮池与活体珊瑚造景展厅，生动展示虾蟹甲壳类的生活习性。',
      'en': 'Expands exhibits to include natural tidepools and living reef formations for crustaceans.',
      'ja': '潮だまりの岩礁やサンゴを模した生息環境を再現し、甲殻類の展示を充実。',
      'ko': '자연 조간대와 산호 군락을 정밀 재현한 2단계 생태 수조를 증축합니다.',
      'es': 'Amplía la exposición con pozas de marea naturales y formaciones coralinas.',
      'fr': 'Élargit les installations aux récifs coralliens et bassins tactiles de marée.',
      'de': 'Erweitert die Ausstellung um natürliche Gezeitentümpel und lebendige Riffe.'
    }
  },
  'museum_tier_3': {
    id: 'museum_tier_3',
    names: {
      'zh-TW': '公立水族館：全景深藍海洋巨蛋 (Tier 3)',
      'zh-CN': '公立水族馆：全景深蓝海洋巨蛋 (Tier 3)',
      'en': 'Museum Oceanarium: Deep Ocean Dome (Tier 3)',
      'ja': '公立水族館：パノラマ大洋ドーム (Tier 3)',
      'ko': '공립 수족관: 파노라마 해양 돔 (Tier 3)',
      'es': 'Gran Oceanario: Cúpula de Alta Mar (Nivel 3)',
      'fr': 'Grand Océanarium : Dôme Océanique (Palier 3)',
      'de': 'Ozeanarium: Tiefsee-Panoramakuppel (Stufe 3)'
    },
    type: 'blueprint',
    price: 1800,
    icon: 'museum',
    description: {
      'zh-TW': '最高等級的環形深海巨幕展館，讓蒼蘭鮪與深海巨蟹在如夢似幻的深藍燈光下游弋！',
      'zh-CN': '最高等级的环形深海巨幕展馆，让苍兰鲔与深海巨蟹在如梦似幻的深蓝灯光下游弋！',
      'en': 'The pinnacle grand panoramic oceanarium dome where pelagic giants swim in azure splendour.',
      'ja': '大迫力の360度パノラマ水槽。ソライロマグロなどの外洋生物が壮大に泳ぎ回る。',
      'ko': '웅장한 360도 해양 파노라마 돔으로 대형 참치와 심해 생물이 유영하는 절경을 완성합니다.',
      'es': 'Cúpula oceánica panorámica de máxima categoría donde nadan los colosos marinos.',
      'fr': 'Le chef-d\'œuvre final : un immense dôme sous-marin à vision panoramique.',
      'de': 'Die Krönung: Eine gigantische Panoramakuppel für Hochseeriesen im azurblauen Licht.'
    }
  }
};
