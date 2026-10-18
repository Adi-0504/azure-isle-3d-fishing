# 蔚藍島嶼：3D釣魚探索遊戲 (Azure Isle 3D Fishing)

一款基於 **Three.js + TypeScript + Vite** 開發的完整 3D 第三人物視角釣魚與生態探索遊戲。融合《動物森友會》(Animal Crossing) 的柔和溫暖自然環境與寶可夢街機 (Pokémon Arcade) 的明快色調與視覺回饋。

---

## 🎮 遊戲特色與核心系統 (Game Features)

1. **六大生態島嶼區域 (6 Island Biomes)**：
   - 🏖️ **南部沙灘 (Southern Beach)**：淺海沙灘、貝殼、海蟹、明媚陽光與蔚藍淺海。
   - 🌲 **森林溪流 (Forest Stream)**：蜿蜒清泉、木製步橋、溯溪的三點鮭。
   - ⛰️ **北部懸崖 (Northern Cliffs)**：雄偉峭壁、高空俯瞰、狂暴巨浪中的深海巨魚。
   - 🏞️ **中央高地湖 (Central Highland Lake)**：火山凹口高山平靜湖泊、金光神仙錦鯉。
   - 🌿 **森林秘境 (Secret Forest Grove)**：密林綠蔭、濕潤青苔、雨夜活躍的黑紋鰻。
   - 🪸 **近岸礁岩及沿海 (Coastal Reefs)**：天然潮池、珊瑚礁石縫、堅硬蒼甲蝦與蒼蘭鮪。

2. **完整釣魚循環 (Fishing Game Loop)**：
   - 靠近水域 -> 揮竿拋線 (Cast) -> 浮標落水微波震盪 -> 水中魚影游向魚餌。
   - 咬鉤警示 (Bite Alert)：浮標下沉水花、水滴音效、高亢街機警示音、頭頂「！」感嘆號告示牌。
   - 一鍵起竿收線 (Reel In) -> 捕獲結算 (3D 旋轉展示模型、名稱、尺寸、星級稀有度、價值) -> 自由選擇【放入背包】或【現場售出】。

3. **11+ 世界觀水生物種與自然圖鑑 (Field Guide)**：
   - **三點鮭**、**蒼蘭鮪**、**紅霞鯛**、**黑紋鰻**、**波光魚**、**藍鑽蝦**、**蒼甲蝦**、**紅楓蟹**、**紅巨蟹**、**白珠貝**、**灰背貝**、**金光神仙錦鯉** 等。
   - 具備未發現剪影遮蔽、最大尺寸紀錄、捕獲次數、棲息地、季節與天氣條件。

4. **時間、四季與天氣生態聯動 (Diurnal & Weather Engine)**：
   - **24分鐘日夜循環**：晨曦粉霞、正午暖陽、日落金霞、繁星夜空與營火動態光。
   - **四季交替**：春季（嫩綠櫻花）、夏季（濃密生機）、秋季（落葉楓紅）、冬季（銀霜積雪）。
   - **天氣變化**：晴空萬里、多雲舒爽、細雨綿綿（具備 3D 雨滴粒子物理與水面漣漪）。

5. **營地建設、木屋擴建與水族館展覽 (Building & Aquarium)**：
   - 初始草地營地（露營帳篷、木椅、營火、儲存木箱）。
   - 購買營造執照升級為**原木小屋**，擴建陽台庭院與花圃。
   - **個人水族箱**：在小屋擺放透明水晶玻璃水箱，真實 3D 魚兒在水箱內悠游！
   - **公立生態水族館**：資助擴建 3 大展區（淡水沿岸展、潮池珊瑚展、深海海洋巨蛋），純展示觀賞設施，不產生被動營利（嚴格遵循規範 #35）。

6. **島嶼經濟與背包系統 (Shop & Economy)**：
   - 零初始資金開局 ($0)，靠釣魚與採集賺取金幣。
   - 自動交易終端機：販售竹竿、碳纖竿、專業獵手海釣竿、大師黃金神竿；蚯蚓餌、夜光餌、特製香濃誘餌；行囊擴充包 (12格 -> 20格 -> 30格)。
   - 告示欄任務系統：提供豐富生態調查任務，達成領取非重複獎勵。

7. **跨平台操作 (Windows + iPad / Tablet)**：
   - **Windows**：WASD/方向鍵移動、Shift 加速奔跑、滑鼠拖曳視角、空白鍵/E 釣魚互動、B 背包、C 圖鑑、Q 任務、ESC 設定。
   - **iPad / 平板觸控**：左側虛擬搖桿、全螢幕滑動鏡頭旋轉、右側加大觸控按鈕集群（釣魚、互動、跑步開關、背包、圖鑑、任務、選單）。

8. **存檔與跨裝置轉移 (Save & Transfer)**：
   - 本機持久化存檔 (IndexedDB / LocalStorage) 與定時自動存檔 (30秒)。
   - 支援 **JSON 手動匯出 / 匯入**，附帶格式結構驗證與防呆機制，方便 Windows 與 iPad 之間無痛互通！

9. **8 國語言即時在地化 (i18n)**：
   - 繁體中文、簡體中文、English、日本語、한국어、Español、Français、Deutsch。

---

## 🛠️ 開發與建置指令 (Build & Run)

### 1. 安裝依賴
```bash
npm install
```

### 2. 啟動本地開發伺服器
```bash
npm run dev
```
瀏覽器開啟 `http://127.0.0.1:3000/` 即可立即遊玩。

### 3. 生產打包 (Production Build for itch.io / Web)
```bash
npm run build
```
建置產物將輸出於 `dist/` 目錄，採用相對路徑 (`./`)，符合 itch.io HTML5 zip 上傳標準。

---

## 📦 itch.io HTML5 發布步驟

1. 執行 `npm run build` 生成 `dist/` 資料夾。
2. 將 `dist/` 資料夾內的全部檔案（包含 `index.html` 與 `assets/`）壓縮為 `game.zip`（注意：`index.html` 必須位於 zip 的根目錄）。
3. 登入 [itch.io](https://itch.io) -> 點擊 **Create new project**。
4. **Kind of project** 選擇 **HTML**。
5. 上傳 `game.zip` 並勾選 **This file will be played in the browser**。
6. 設定視窗解析度為自適應（預設推薦 1280x720 或全螢幕），儲存發布即可。

---

## 📂 專案架構 (Project Structure)

```text
fishing-game/
├── public/
│   └── assets/
│       ├── models/
│       ├── textures/
│       ├── materials/
│       ├── animations/
│       ├── audio/
│       ├── shaders/
│       ├── ui/
│       └── temp/
├── src/
│   ├── audio/
│   │   └── SoundSynthesizer.ts    # Web Audio API 原生音訊管線
│   ├── building/
│   │   └── BuildingManager.ts     # 木屋擴建與個人/公立水族館系統
│   ├── ecology/
│   │   └── CreatureModelGenerator.ts # 11+ 物種 3D 模型與骨架動畫生成器
│   ├── fishing/
│   │   └── FishingSystem.ts       # 釣魚拋線、浮標、咬鉤警示與拉扯起竿
│   ├── player/
│   │   ├── PlayerController.ts    # 鍵盤/虛擬搖桿雙模式控制器與相機
│   │   └── PlayerModel.ts         # 動漫少年漁夫 3D 模型、骨架與外觀客製
│   ├── save/
│   │   └── SaveManager.ts         # 存檔、結構驗證與 JSON 跨裝置匯出入
│   ├── ui/
│   │   └── UIManager.ts           # 玻璃擬態 HUD、對話框與 3D 旋轉預覽
│   ├── world/
│   │   ├── IslandTerrain.ts       # 六大生態地貌、高度場演算法與自然植被
│   │   ├── WaterSystem.ts         # 水面動態頂點波浪、漣漪與魚影游動
│   │   └── WeatherTimeSystem.ts   # 24分鐘日夜循環、四季光照與 3D 雨滴粒子
│   ├── main.ts                    # 遊戲主調度循環
│   └── style.css                  # 跨端響應式 Vanilla CSS 樣式
├── data/
│   ├── fish/
│   │   └── CreatureDatabase.ts    # 11+ 生態物種詳細設定與生成條件
│   ├── items/
│   │   └── ItemsDatabase.ts       # 釣竿、魚餌、行囊擴充與建造藍圖
│   ├── localization/
│   │   └── i18n.ts                # 8 國語言完整對照字典
│   └── quests/
│       └── QuestsDatabase.ts      # 島嶼公告欄生態探索任務庫
├── docs/
│   ├── ART_DIRECTION.md           # 美術風格定位、色彩規範與模型比例
│   ├── ASSET_INVENTORY.md         # 素材清單、幾何面數與驗收紀錄
│   ├── ASSET_LICENSES.md          # 合法授權追溯清單 (MIT / CC0)
│   └── RELEASE_CHECKLIST.md       # 22 項發布驗收檢核成果
├── index.html                     # 現代化遊戲結構與全功能介面
├── package.json
├── tsconfig.json
└── vite.config.ts
```
