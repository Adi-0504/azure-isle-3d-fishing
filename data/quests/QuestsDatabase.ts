import { SupportedLanguage } from '../localization/i18n';

export interface QuestData {
  id: string;
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  targetType: 'catch_species' | 'catch_count' | 'explore_biome' | 'upgrade_gear' | 'build_cabin';
  targetSpeciesId?: string;
  targetCount: number;
  targetBiome?: string;
  rewardCoins: number;
  rewardItem?: string;
}

export const QUESTS_DATABASE: QuestData[] = [
  {
    id: 'quest_first_catch',
    title: {
      'zh-TW': '小試身手：初次揮竿',
      'zh-CN': '小试身手：初次挥竿',
      'en': 'First Cast: Novice Angler',
      'ja': '最初の一歩：はじめての釣り',
      'ko': '첫 걸음: 초보 낚시꾼',
      'es': 'Primer Lanzamiento: Pescador Novato',
      'fr': 'Premier Lancer : Pêcheur Débutant',
      'de': 'Erster Auswurf: Angel-Neuling'
    },
    description: {
      'zh-TW': '在營地溪流或沙灘成功釣起任意 2 隻水生生物，熟悉拋竿與起竿節奏。',
      'zh-CN': '在营地溪流或沙滩成功钓起任意 2 只水生生物，熟悉抛竿与起竿节奏。',
      'en': 'Catch any 2 creatures in the stream or beach to get accustomed to rod controls.',
      'ja': '川や砂浜で生き物を2匹釣り上げ、キャストとアタリの感覚を掴もう。',
      'ko': '계곡이나 해변에서 아무 생물이나 2마리 낚아 손맛을 익혀보세요.',
      'es': 'Pesca 2 criaturas cualesquiera para familiarizarte con los controles de la caña.',
      'fr': 'Attrapez 2 créatures dans le ruisseau ou à la plage pour vous faire la main.',
      'de': 'Fange 2 beliebige Wassertiere im Fluss oder am Strand.'
    },
    targetType: 'catch_count',
    targetCount: 2,
    rewardCoins: 80,
    rewardItem: 'bait_worm'
  },
  {
    id: 'quest_three_dot_salmon',
    title: {
      'zh-TW': '溪流觀察：尋找三點鮭',
      'zh-CN': '溪流观察：寻找三点鲑',
      'en': 'Stream Survey: Three-dot Salmon',
      'ja': '清流の調査：ミツボシサケを探せ',
      'ko': '계곡 탐사: 세점연어를 찾아서',
      'es': 'Sondeo del Arroyo: Salmón de Tres Puntos',
      'fr': 'Étude de Ruisseau : Saumon à Trois Points',
      'de': 'Flussuntersuchung: Dreipunkt-Lachs'
    },
    description: {
      'zh-TW': '前往森林溪流，成功捕獲 2 尾活潑的三點鮭並記錄入圖鑑。',
      'zh-CN': '前往森林溪流，成功捕获 2 尾活泼的三点鲑并记录入图鉴。',
      'en': 'Head to the Forest Stream and catch 2 vigorous Three-dot Salmon.',
      'ja': '森の渓流で銀鱗が美しいミツボシサケを2匹釣り上げる。',
      'ko': '숲속 계곡으로 이동하여 세점연어 2마리를 낚아 관찰하세요.',
      'es': 'Dirígete al Arroyo del Bosque y pesca 2 Salmones de Tres Puntos.',
      'fr': 'Rendez-vous au Ruisseau Forestier et capturez 2 Saumons à Trois Points.',
      'de': 'Begib dich zum Waldfluss und fange 2 Dreipunkt-Lachse.'
    },
    targetType: 'catch_species',
    targetSpeciesId: 'three_dot_salmon',
    targetCount: 2,
    rewardCoins: 150,
    rewardItem: 'bait_glow'
  },
  {
    id: 'quest_pearl_clam',
    title: {
      'zh-TW': '海岸漫步：採集白珠貝',
      'zh-CN': '海岸漫步：采集白珠贝',
      'en': 'Beachcomber: White Pearl Clams',
      'ja': '浜辺の散策：シラタマガイの採集',
      'ko': '해변 산책: 백진주조개 채집',
      'es': 'Recolector Costero: Almejas Perla Blanca',
      'fr': 'Balade Côtière : Palourdes Perle Blanche',
      'de': 'Strandgänger: Weiße Perlenmuscheln'
    },
    description: {
      'zh-TW': '在陽光明媚的南部沙灘淺灘尋覓並收穫 2 顆潔白的白珠貝。',
      'zh-CN': '在阳光明媚的南部沙滩浅滩寻觅并收获 2 颗洁白的白珠贝。',
      'en': 'Comb the Southern Beach shallows and collect 2 White Pearl Clams.',
      'ja': '南の砂浜の浅瀬で純白のシラタマガイを2個手に入れる。',
      'ko': '남쪽 해변의 따뜻한 모래펄에서 백진주조개 2개를 채집하세요.',
      'es': 'Pasea por la Playa del Sur y recolecta 2 Almejas Perla Blanca.',
      'fr': 'Parcourez la Plage du Sud et ramassez 2 Palourdes Perle Blanche.',
      'de': 'Durchkämme den Südstrand und sammle 2 Weiße Perlenmuscheln.'
    },
    targetType: 'catch_species',
    targetSpeciesId: 'white_pearl_clam',
    targetCount: 2,
    rewardCoins: 160
  },
  {
    id: 'quest_explore_cliffs',
    title: {
      'zh-TW': '登高望遠：探訪北部懸崖',
      'zh-CN': '登高望远：探访北部悬崖',
      'en': 'Pathfinder: Trek to Northern Cliffs',
      'ja': '高みを目指して：北の断崖絶壁を踏破',
      'ko': '절경 탐방: 북쪽 절벽에 도달하라',
      'es': 'Explorador: Ruta a los Acantilados del Norte',
      'fr': 'Pionnier : Atteindre les Falaises du Nord',
      'de': 'Pfadfinder: Aufstieg zu den Nordklippen'
    },
    description: {
      'zh-TW': '沿著山徑步道徒步前往島嶼北端的地勢最高點——北部懸崖。',
      'zh-CN': '沿着山径步道徒步前往岛屿北端的地势最高点——北部悬崖。',
      'en': 'Hike up the rugged mountain trail to reach the Northern Cliffs vantage point.',
      'ja': '島北部の最高峰、大迫力の断崖絶壁エリアまで歩いて到達する。',
      'ko': '산길을 따라 걸어올라가 섬에서 가장 웅장한 북쪽 절벽에 발을 디뎌보세요.',
      'es': 'Sube por el sendero montañoso hasta alcanzar los imponentes Acantilados del Norte.',
      'fr': 'Grimpez le sentier escarpé pour atteindre le sommet des Falaises du Nord.',
      'de': 'Wandere den Bergpfad hinauf, um den Aussichtspunkt der Nordklippen zu erreichen.'
    },
    targetType: 'explore_biome',
    targetBiome: 'cliffs',
    targetCount: 1,
    rewardCoins: 200,
    rewardItem: 'bait_master'
  },
  {
    id: 'quest_upgrade_rod',
    title: {
      'zh-TW': '裝備升級：入手碳纖維釣竿',
      'zh-CN': '装备升级：入手碳纤维钓竿',
      'en': 'Gear Up: Carbon Fiber Rod',
      'ja': '装備の近代化：カーボンロッドを入手',
      'ko': '장비 업그레이드: 카본 낚싯대 구비',
      'es': 'Mejora de Equipo: Caña de Fibra de Carbono',
      'fr': 'Équipement Supérieur : Canne en Carbone',
      'de': 'Ausrüstungs-Upgrade: Karbonfaser-Angel'
    },
    description: {
      'zh-TW': '在島上任意自動交易終端機購買裝備「碳纖維靈動釣竿」，提升釣力。',
      'zh-CN': '在岛上任意自动交易终端机购买装备“碳纤维灵动钓竿”，提升钓力。',
      'en': 'Purchase the Carbon Fiber Rod from any trading terminal.',
      'ja': '島内の取引端末でカーボン釣り竿を購入し、さらなる大物に備えよう。',
      'ko': '거래 터미널에서 카본 피싱 로드를 구입하여 낚시 성능을 높이세요.',
      'es': 'Compra la Caña de Fibra de Carbono en cualquier terminal de la isla.',
      'fr': 'Achetez la Canne en Carbone Agile à la borne de commerce.',
      'de': 'Kaufe die Karbonfaser-Angel an einem Inselterminal.'
    },
    targetType: 'upgrade_gear',
    targetCount: 1,
    rewardCoins: 250
  },
  {
    id: 'quest_build_cabin',
    title: {
      'zh-TW': '定居島嶼：搭建原木小屋',
      'zh-CN': '定居岛屿：搭建原木小屋',
      'en': 'Island Haven: Construct Log Cabin',
      'ja': '定住の第一歩：ログハウスを建築',
      'ko': '섬 정착: 아늑한 원목 오두막 건축',
      'es': 'Hogar Isleño: Construye la Cabaña',
      'fr': 'Refuge Insulaire : Construire le Chalet',
      'de': 'Inselheimat: Baue die Blockhütte'
    },
    description: {
      'zh-TW': '在終端機購買原木小屋營造執照，將露營帳篷升級為溫馨的小木屋！',
      'zh-CN': '在终端机购买原木小屋营造执照，将露营帐篷升级为温馨的小木屋！',
      'en': 'Acquire the Log Cabin Blueprint and upgrade your campsite from tent to cabin.',
      'ja': '建築許可証を入手し、キャンプサイトのテントを温かな木造キャビンへ改築する。',
      'ko': '건축 허가서를 구매하여 캠프장의 텐트를 튼튼한 목조 오두막으로 업그레이드하세요.',
      'es': 'Adquiere el plano y transforma tu tienda de campaña en una cabaña de madera.',
      'fr': 'Achetez le permis de construire et remplacez votre tente par un vrai chalet.',
      'de': 'Erwirb den Bauplan und verwandle dein Zeltcamp in eine feste Blockhütte.'
    },
    targetType: 'build_cabin',
    targetCount: 1,
    rewardCoins: 350
  }
];
