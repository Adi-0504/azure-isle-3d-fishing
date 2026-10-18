import { SupportedLanguage } from '../localization/i18n';

export type CreatureCategory = 'fish' | 'shrimp' | 'crab' | 'clam';
export type BiomeId = 'beach' | 'stream' | 'cliffs' | 'lake' | 'grove' | 'reefs';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy';
export type TimeFilter = 'day' | 'night' | 'any';

export interface CreatureData {
  id: string;
  names: Record<SupportedLanguage, string>;
  category: CreatureCategory;
  biomes: BiomeId[];
  seasons: SeasonType[];
  weathers: WeatherType[];
  timeOfDay: TimeFilter;
  minRodTier: number; // 1: Basic, 2: Carbon, 3: Pro, 4: Master
  basePrice: number;
  minSize: number; // cm
  maxSize: number; // cm
  rarity: 1 | 2 | 3 | 4 | 5;
  colorBase: number;
  colorAccent: number;
  descriptions: Record<SupportedLanguage, string>;
}

export const CREATURE_DATABASE: CreatureData[] = [
  {
    id: 'three_dot_salmon',
    names: {
      'zh-TW': '三點鮭',
      'zh-CN': '三点鲑',
      'en': 'Three-dot Salmon',
      'ja': 'ミツボシサケ',
      'ko': '세점연어',
      'es': 'Salmón de Tres Puntos',
      'fr': 'Saumon à Trois Points',
      'de': 'Dreipunkt-Lachs'
    },
    category: 'fish',
    biomes: ['stream', 'lake'],
    seasons: ['spring', 'autumn', 'winter'],
    weathers: ['sunny', 'cloudy', 'rainy'],
    timeOfDay: 'any',
    minRodTier: 1,
    basePrice: 65,
    minSize: 32,
    maxSize: 68,
    rarity: 2,
    colorBase: 0xdb6b78,
    colorAccent: 0xf3d2c1,
    descriptions: {
      'zh-TW': '身體兩側具有醒目的三顆黑色斑點，溯溪而上的矯健身影是清晨溪流的美景。',
      'zh-CN': '身体两侧具有醒目的三颗黑色斑点，溯溪而上的矫健身影是清晨溪流的美景。',
      'en': 'Notable for three pitch-black dots on its silvery-pink flanks. Swims vigorously upstream.',
      'ja': '体側にくっきりと並ぶ3つの黒点がトレードマーク。清流を力強く遡上する。',
      'ko': '은빛 분홍 몸통 옆면에 선명한 세 개의 흑점이 특징인 건강한 계곡 연어입니다.',
      'es': 'Famoso por los tres puntos negros en sus flancos plateados y rosados. Remonta el río con vigor.',
      'fr': 'Reconnaissable à ses trois points noirs caractéristiques sur ses flancs rosés argentés.',
      'de': 'Auffällig durch drei pechschwarze Punkte auf seinen silbrig-rosigen Flanken.'
    }
  },
  {
    id: 'azure_tuna',
    names: {
      'zh-TW': '蒼蘭鮪',
      'zh-CN': '苍兰鲔',
      'en': 'Azure Tuna',
      'ja': 'ソライロマグロ',
      'ko': '청람다랑어',
      'es': 'Atún Azur',
      'fr': 'Thon d\'Azur',
      'de': 'Azur-Thunfisch'
    },
    category: 'fish',
    biomes: ['reefs', 'cliffs'],
    seasons: ['summer', 'autumn'],
    weathers: ['sunny', 'cloudy'],
    timeOfDay: 'day',
    minRodTier: 3,
    basePrice: 380,
    minSize: 95,
    maxSize: 180,
    rarity: 5,
    colorBase: 0x00509d,
    colorAccent: 0xfdc500,
    descriptions: {
      'zh-TW': '棲息於深海與外海礁岩區的巨型魚類，背部如蒼穹般蔚藍，游速極快、拉力強勁。',
      'zh-CN': '栖息于深海与外海礁岩区的巨型鱼类，背部如苍穹般蔚蓝，游速极快、拉力强劲。',
      'en': 'A magnificent pelagic torpedo with deep azure scales and golden finlets. Extremely swift.',
      'ja': '外洋の岩礁帯を回遊する海の王者。蒼穹のように輝く青い背びれが特徴。',
      'ko': '외해 암초 지대를 유영하는 대형 어종으로, 창공을 닮은 푸른빛과 강한 힘을 자랑합니다.',
      'es': 'Majestuoso pez pelágico de lomo azul brillante y aletas doradas. Increíblemente veloz.',
      'fr': 'Un prédateur pélagique majestueux au dos bleu saphir et aux nageoires dorées.',
      'de': 'Ein majestätischer Hochseefisch mit tiefblauem Rücken und goldenen Flossen.'
    }
  },
  {
    id: 'sunset_sea_bream',
    names: {
      'zh-TW': '紅霞鯛',
      'zh-CN': '红霞鲷',
      'en': 'Sunset Sea Bream',
      'ja': 'ユウバエダイ',
      'ko': '노을도미',
      'es': 'Dorada Atardecer',
      'fr': 'Daurade Crépuscule',
      'de': 'Abendrot-Meerbrasse'
    },
    category: 'fish',
    biomes: ['beach', 'reefs'],
    seasons: ['spring', 'summer', 'autumn'],
    weathers: ['sunny', 'cloudy'],
    timeOfDay: 'any',
    minRodTier: 2,
    basePrice: 120,
    minSize: 28,
    maxSize: 55,
    rarity: 3,
    colorBase: 0xd90429,
    colorAccent: 0xffb703,
    descriptions: {
      'zh-TW': '通體呈現晚霞般的暖紅色光澤，喜愛在陽光溫暖的淺灘與沙洲邊緣覓食。',
      'zh-CN': '通体呈现晚霞般的暖红色光泽，喜爱在阳光温暖的浅滩与沙洲边缘觅食。',
      'en': 'Shimmers with the warm fiery red of a golden sunset. Favors warm shallows near beaches.',
      'ja': '夕焼けのように鮮やかな赤色の体躯。砂浜や岩礁の穏やかな波打ち際を好む。',
      'ko': '저녁 노을을 머금은 듯한 붉은 광택의 도미로, 따뜻한 모래사장 인근에서 자주 발견됩니다.',
      'es': 'Brilla con los tonos carmesí del atardecer. Le encantan los bancos de arena cálidos.',
      'fr': 'Brille des lueurs rougeoyantes d\'un coucher de soleil. Fréquente les hauts-fonds.',
      'de': 'Schimmert im feurigen Abendrot. Liebt seichte Gewässer entlang sonniger Strände.'
    }
  },
  {
    id: 'black_striped_eel',
    names: {
      'zh-TW': '黑紋鰻',
      'zh-CN': '黑纹鳗',
      'en': 'Black-striped Eel',
      'ja': 'クロシマウナギ',
      'ko': '흑줄장어',
      'es': 'Anguila Rayada',
      'fr': 'Anguille Zébrée',
      'de': 'Schwarzstreifen-Aal'
    },
    category: 'fish',
    biomes: ['stream', 'grove'],
    seasons: ['summer', 'autumn'],
    weathers: ['rainy', 'cloudy'],
    timeOfDay: 'night',
    minRodTier: 2,
    basePrice: 160,
    minSize: 50,
    maxSize: 110,
    rarity: 3,
    colorBase: 0x2b2d42,
    colorAccent: 0x8d99ae,
    descriptions: {
      'zh-TW': '身體細長如帶，覆蓋著墨黑色的環紋，在雨夜與濃蔭密布的幽靜水流中最為活躍。',
      'zh-CN': '身体细长如带，覆盖着墨黑色的环纹，在雨夜与浓荫密布的幽静水流中最为主跃。',
      'en': 'Slender ribbon-like body patterned with dark banded rings. Active during rainy nights.',
      'ja': 'リボンのようにしなやかな体と黒い縞模様。雨の夜や木陰の奥深くで活発に泳ぐ。',
      'ko': '먹물 같은 검은 줄무늬를 두른 장어로, 비 내리는 밤이나 깊은 숲 그늘에서 주로 포착됩니다.',
      'es': 'Cuerpo ondulante en forma de cinta con bandas oscuras. Muy activo en noches lluviosas.',
      'fr': 'Corps fuselé comme un ruban orné d\'anneaux sombres. Nocturne et amateur de pluie.',
      'de': 'Schlanker, bandförmiger Körper mit dunklen Ringen. Besonders aktiv in Regennächten.'
    }
  },
  {
    id: 'glimmer_fish',
    names: {
      'zh-TW': '波光魚',
      'zh-CN': '波光鱼',
      'en': 'Glimmer Fish',
      'ja': 'ハコウギョ',
      'ko': '물결빛물고기',
      'es': 'Pez Centelleante',
      'fr': 'Poisson Scintillant',
      'de': 'Glimmerfisch'
    },
    category: 'fish',
    biomes: ['lake', 'grove', 'cliffs'],
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    weathers: ['sunny', 'cloudy', 'rainy'],
    timeOfDay: 'night',
    minRodTier: 1,
    basePrice: 90,
    minSize: 15,
    maxSize: 30,
    rarity: 2,
    colorBase: 0x48cae4,
    colorAccent: 0xffffff,
    descriptions: {
      'zh-TW': '魚鱗自帶微弱的生物螢光，游動時如水面上蕩漾的一抹幽藍星光，極具觀賞價值。',
      'zh-CN': '鱼鳞自带微弱的生物荧光，游动时如水面上荡漾的一抹幽蓝星光，极具观赏价值。',
      'en': 'Scales emit a gentle bioluminescent aura, resembling floating starlight upon dark ripples.',
      'ja': '淡い生物発光を放つ鱗を持ち、夜の水面に星屑が揺れているかのような神秘的な美しさ。',
      'ko': '비늘에서 은은한 생체 발광을 뿜어내어 밤물결 위에 별빛이 흐르는 듯한 환상적인 물고기입니다.',
      'es': 'Sus escamas emiten una suave bioluminiscencia como estrellas flotantes sobre el agua.',
      'fr': 'Ses écailles bioluminescentes brillent doucement comme de la poussière d\'étoiles dans la nuit.',
      'de': 'Seine Schuppen erzeugen sanftes Meeresleuchten wie tanzende Sternenlichter auf dem Wasser.'
    }
  },
  {
    id: 'blue_diamond_shrimp',
    names: {
      'zh-TW': '藍鑽蝦',
      'zh-CN': '蓝钻虾',
      'en': 'Blue Diamond Shrimp',
      'ja': 'ブループリズムエビ',
      'ko': '블루다이아몬드새우',
      'es': 'Camarón Diamante Azul',
      'fr': 'Crevette Diamant Bleu',
      'de': 'Blauer Diamantkrebs'
    },
    category: 'shrimp',
    biomes: ['stream', 'lake'],
    seasons: ['spring', 'summer'],
    weathers: ['sunny', 'cloudy'],
    timeOfDay: 'day',
    minRodTier: 1,
    basePrice: 50,
    minSize: 6,
    maxSize: 14,
    rarity: 2,
    colorBase: 0x00b4d8,
    colorAccent: 0xcaf0f8,
    descriptions: {
      'zh-TW': '半透明的淡藍色晶瑩甲殼，觸角長而優雅，常藏身於清澈溪流的水生草叢之中。',
      'zh-CN': '半透明的淡蓝色晶莹甲壳，触角长而优雅，常藏身于清澈溪流的水生草丛之中。',
      'en': 'Has a translucent sapphire shell and slender antennae. Grazes on aquatic flora.',
      'ja': '水晶のように透き通る青い甲殻と優雅な長い触角。清らかな渓流の藻場に棲息する。',
      'ko': '보석처럼 투명한 푸른빛 껍질을 지녔으며, 맑은 시냇물의 수초 사이에 서식합니다.',
      'es': 'Caparazón translúcido de zafiro con largas y elegantes antenas. Vive entre algas de río.',
      'fr': 'Carapace cristalline d\'un bleu azur transparent, dotée de longues antennes délicates.',
      'de': 'Kristallklarer saphirblauer Panzer mit langen Fühlern. Versteckt sich in Flussalgen.'
    }
  },
  {
    id: 'azure_carapace_shrimp',
    names: {
      'zh-TW': '蒼甲蝦',
      'zh-CN': '苍甲虾',
      'en': 'Azure Carapace Shrimp',
      'ja': 'アオヨロイエビ',
      'ko': '창갑새우',
      'es': 'Camarón Acorazado Azur',
      'fr': 'Crevette Cuirassée',
      'de': 'Azur-Panzergarnele'
    },
    category: 'shrimp',
    biomes: ['reefs', 'beach'],
    seasons: ['spring', 'autumn', 'winter'],
    weathers: ['sunny', 'cloudy', 'rainy'],
    timeOfDay: 'any',
    minRodTier: 2,
    basePrice: 110,
    minSize: 12,
    maxSize: 26,
    rarity: 3,
    colorBase: 0x1d3557,
    colorAccent: 0xa8dadc,
    descriptions: {
      'zh-TW': '身披堅固厚實的深藍色鎧甲，雙爪銳利，是沿岸潮池與礁岩石縫中的強壯獵手。',
      'zh-CN': '身披坚固厚实的深蓝色铠甲，双爪锐利，是沿岸潮池与礁岩石缝中的强壮猎手。',
      'en': 'Armored in deep indigo chitin. Tough coastal dweller that thrives in rockpools.',
      'ja': '深海を思わせる紺色の重厚なヨロイをまとう。潮だまりの岩場を器用に移動する。',
      'ko': '단단한 짙푸른 갑각과 날카로운 집게발을 지닌 바위틈의 강인한 생명체입니다.',
      'es': 'Acorazado con un caparazón azul índigo resistente. Domina las pozas rocosas de marea.',
      'fr': 'Protégée par une épaisse carapace indigo, elle habite les failles des récifs côtiers.',
      'de': 'Mit robustem indigoblauem Panzer bewehrt. Gedeiht in felsigen Gezeitentümpeln.'
    }
  },
  {
    id: 'maple_crab',
    names: {
      'zh-TW': '紅楓蟹',
      'zh-CN': '红枫蟹',
      'en': 'Maple Crab',
      'ja': 'モミジガニ',
      'ko': '단풍게',
      'es': 'Cangrejo Arce',
      'fr': 'Crabe d\'Érable',
      'de': 'Ahornkrabbe'
    },
    category: 'crab',
    biomes: ['grove', 'stream', 'beach'],
    seasons: ['autumn', 'winter'],
    weathers: ['sunny', 'cloudy'],
    timeOfDay: 'any',
    minRodTier: 1,
    basePrice: 75,
    minSize: 10,
    maxSize: 22,
    rarity: 2,
    colorBase: 0xc1121f,
    colorAccent: 0xfdf0d5,
    descriptions: {
      'zh-TW': '甲殼形狀宛若一片飄落的深秋紅楓葉，性情溫和，常橫行於濕潤的落葉堆與淺灘。',
      'zh-CN': '甲壳形状宛若一片飘落的深秋红枫叶，性情温和，常横行于湿润的落叶堆与浅滩。',
      'en': 'Carapace resembles a fallen crimson autumn leaf. Skitters peacefully across wet pebbles.',
      'ja': '甲羅の形と鮮やかな赤色が紅葉を思わせる。落ち葉の積もる水辺をゆったり横歩きする。',
      'ko': '붉은 단풍잎 모양의 등딱지를 가진 게로, 가을철 낙엽이 깔린 시냇가 주변을 거닙니다.',
      'es': 'Su caparazón evoca una hoja de arce carmesí. Camina pacíficamente entre guijarros húmedos.',
      'fr': 'Sa carapace rappelle une feuille d\'érable automnale. Paisible habitant des feuilles mouillées.',
      'de': 'Sein Panzer gleicht einem herbstlichen Ahornblatt. Wandert friedlich über feuchten Kies.'
    }
  },
  {
    id: 'giant_red_crab',
    names: {
      'zh-TW': '紅巨蟹',
      'zh-CN': '红巨蟹',
      'en': 'Giant Red Crab',
      'ja': 'オオアカガニ',
      'ko': '거대붉은게',
      'es': 'Cangrejo Rojo Gigante',
      'fr': 'Crabe Rouge Géant',
      'de': 'Rote Riesenkrabbe'
    },
    category: 'crab',
    biomes: ['cliffs', 'reefs'],
    seasons: ['winter', 'spring'],
    weathers: ['cloudy', 'rainy'],
    timeOfDay: 'any',
    minRodTier: 3,
    basePrice: 320,
    minSize: 35,
    maxSize: 75,
    rarity: 4,
    colorBase: 0x780000,
    colorAccent: 0xd90429,
    descriptions: {
      'zh-TW': '外殼長有尖銳骨刺的大型海蟹，雙螯碩大有力，生活在懸崖底部的冷冽湧浪之中。',
      'zh-CN': '外壳长有尖锐骨刺的大型海蟹，双螯硕大有力，生活在悬崖底部的冷冽涌浪之中。',
      'en': 'Heavily spined mega-crab with crushing pincers that withstands crushing deep surges.',
      'ja': '巨大なハサミとトゲ付きの頑丈な甲殻を持つ深海ガニ。荒波打ち寄せる断崖に潜む。',
      'ko': '거대한 집게발과 뾰족한 가시를 지닌 대형 게로, 북쪽 절벽 아래의 찬 파도 속에 서식합니다.',
      'es': 'Cangrejo colosal cubierto de espinas con pinzas trituradoras que desafía las olas.',
      'fr': 'Un crabe titanesque aux pinces broyeuses colossales qui résiste aux lames de fond.',
      'de': 'Mächtige Tiefseekrabbe mit gewaltigen Zangen, die schroffe Klippenbrandungen bewohnt.'
    }
  },
  {
    id: 'white_pearl_clam',
    names: {
      'zh-TW': '白珠貝',
      'zh-CN': '白珠贝',
      'en': 'White Pearl Clam',
      'ja': 'シラタマガイ',
      'ko': '백진주조개',
      'es': 'Almeja Perla Blanca',
      'fr': 'Palourde Perle Blanche',
      'de': 'Weiße Perlenmuschel'
    },
    category: 'clam',
    biomes: ['beach'],
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    weathers: ['sunny', 'cloudy'],
    timeOfDay: 'any',
    minRodTier: 1,
    basePrice: 85,
    minSize: 8,
    maxSize: 18,
    rarity: 2,
    colorBase: 0xf8f9fa,
    colorAccent: 0xe9ecef,
    descriptions: {
      'zh-TW': '潔白溫潤的雙扇貝殼，內部偶爾孕育著散發天然柔光的小珍珠，是沙灘上的珍寶。',
      'zh-CN': '洁白温润的双扇贝壳，内部偶尔孕育着散发天然柔光的小珍珠，是沙滩上的珍宝。',
      'en': 'Silky white bivalve shell often sheltering miniature lustrous natural pearls.',
      'ja': '真珠の母貝となる上品な白い二枚貝。砂浜の潮が引いた浅瀬で砂に埋もれている。',
      'ko': '부드러운 우윳빛 조개껍질 속에 천연 진주를 품고 있는 남쪽 해변의 대표 조개입니다.',
      'es': 'Bivalvo blanco y sedoso que en ocasiones esconde diminutas perlas resplandecientes.',
      'fr': 'Coquillage bivalve d\'un blanc immaculé abritant parfois de petites perles brillantes.',
      'de': 'Schneeweiße zweischalige Muschel, die gelegentlich schimmernde Naturperlen birgt.'
    }
  },
  {
    id: 'grey_back_clam',
    names: {
      'zh-TW': '灰背貝',
      'zh-CN': '灰背贝',
      'en': 'Grey-back Clam',
      'ja': 'ハイイロハマグリ',
      'ko': '회색등조개',
      'es': 'Almeja Lomo Gris',
      'fr': 'Palourde au Dos Gris',
      'de': 'Graurückenmuschel'
    },
    category: 'clam',
    biomes: ['reefs', 'beach'],
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    weathers: ['sunny', 'cloudy', 'rainy'],
    timeOfDay: 'any',
    minRodTier: 1,
    basePrice: 40,
    minSize: 7,
    maxSize: 15,
    rarity: 1,
    colorBase: 0x6c757d,
    colorAccent: 0xadb5bd,
    descriptions: {
      'zh-TW': '外殼厚重堅實，呈現質樸的石灰色輪紋，能牢牢吸附於潮間帶礁石上對抗強風暴浪。',
      'zh-CN': '外壳厚重坚实，呈现质朴的石灰色轮纹，能牢牢吸附于潮间带礁石上对抗强风暴浪。',
      'en': 'A rugged grey bivalve built like stone. Firmly anchors to intertidal reef boulders.',
      'ja': '石のように頑丈な灰色の貝殻。潮間帯の岩にしっかりと固着して荒波を耐え抜く。',
      'ko': '돌처럼 단단한 잿빛 조개로, 조간대 암초에 단단히 부착되어 거센 파도를 견뎌냅니다.',
      'es': 'Bivalvo gris resistente como roca que se aferra con fuerza a los arrecifes costeros.',
      'fr': 'Palourde grise robuste taillée comme la roche, s\'accrochant solidement aux récifs.',
      'de': 'Robuste graue Muschel, die sich felsenfest an Gezeitenriffen gegen Brandungen festklammert.'
    }
  },
  {
    id: 'golden_koi',
    names: {
      'zh-TW': '金光神仙錦鯉',
      'zh-CN': '金光神仙锦鲤',
      'en': 'Golden Koi',
      'ja': '黄金錦鯉',
      'ko': '황금비단잉어',
      'es': 'Koi Dorado',
      'fr': 'Carpe Koï Dorée',
      'de': 'Goldener Koi'
    },
    category: 'fish',
    biomes: ['lake', 'grove'],
    seasons: ['spring', 'summer', 'autumn'],
    weathers: ['sunny', 'cloudy'],
    timeOfDay: 'day',
    minRodTier: 3,
    basePrice: 450,
    minSize: 45,
    maxSize: 90,
    rarity: 5,
    colorBase: 0xffb703,
    colorAccent: 0xfb8500,
    descriptions: {
      'zh-TW': '通體閃爍著祥瑞金光的稀有淡水魚，相傳能帶來好運與豐收，悠游於中央高地湖。',
      'zh-CN': '通体闪烁着祥瑞金光的稀有淡水鱼，相传能带来好运与丰收，悠游于中央高地湖。',
      'en': 'A legendary auspicious freshwater carp shimmering with radiant gold scales.',
      'ja': '幸運と繁栄をもたらすと伝わる伝説の錦鯉。黄金色に輝きながら高地湖を舞う。',
      'ko': '행운을 상징하는 전설적인 황금빛 비단잉어로, 중앙 고원 호수의 깊은 곳에서 유영합니다.',
      'es': 'Carpa mística resplandeciente con escamas doradas que según la leyenda trae fortuna.',
      'fr': 'Une carpe légendaire aux écailles d\'or étincelantes, symbole de sérénité et de chance.',
      'de': 'Ein sagenumwobener Süßwasserkarpfen mit leuchtenden Goldschuppen, ein Symbol des Glücks.'
    }
  }
];

export function getCreatureById(id: string): CreatureData | undefined {
  return CREATURE_DATABASE.find(c => c.id === id);
}

export function getCreaturesForConditions(
  biome: BiomeId,
  season: SeasonType,
  weather: WeatherType,
  isNight: boolean,
  rodTier: number
): CreatureData[] {
  return CREATURE_DATABASE.filter(c => {
    if (!c.biomes.includes(biome)) return false;
    if (!c.seasons.includes(season)) return false;
    if (!c.weathers.includes(weather)) return false;
    if (c.timeOfDay === 'day' && isNight) return false;
    if (c.timeOfDay === 'night' && !isNight) return false;
    if (c.minRodTier > rodTier) return false;
    return true;
  });
}
