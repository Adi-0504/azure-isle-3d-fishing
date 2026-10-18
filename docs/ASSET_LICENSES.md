# 素材授權紀錄 (Asset Licenses)

本專案遵守嚴格的素材授權規範：拒絕使用未授權第三方商標與IP，所有模型、音訊、紋理均源自合規開源授權（CC0 / CC-BY）或由 Three.js 程序化生成引擎原生建構，保障 itch.io 及 HTML5 商業與發行相容性。

| 素材名稱 | 作者 / 發布者 | 原始網址 / 庫 | 授權名稱與條款 | 商業使用 | 修改權 | 再散布權 | 署名要求 | 驗收狀態 | 專案路徑 |
|---------|--------------|---------------|----------------|---------|-------|---------|---------|---------|---------|
| 動態漁夫角色模型與骨架 (Fisher Character) | 自製技術程序化網格生成 (In-house Engine) | 原創代碼模型生成 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/player/PlayerModel.ts` |
| 六大生態島嶼程序化地貌 (Island Biomes) | 自製技術程序化網格生成 (In-house Engine) | 原創地貌與頂點色彩系統 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/world/IslandTerrain.ts` |
| 11+ 生態水生生物模型 (Fish/Crab/Shrimp/Clam) | 自製風格化幾何模型系統 | 原創程序化模型 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/ecology/CreatureModelGenerator.ts` |
| 露營帳篷、營火、木箱、終端機模型 | 自製風格化道具庫 | 原創道具幾何體 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/building/PropModels.ts` |
| 釣竿與浮標模型 (Fishing Rods & Bobber) | 自製裝備網格庫 | 原創裝備幾何體 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/fishing/FishingRodModel.ts` |
| 療癒自然環境音與釣魚音效合成器 | Web Audio API 實時程序化音效管線 | 原創音效合成引擎 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/audio/SoundSynthesizer.ts` |
| 風格化水面著色器 (Water Shader) | 自製頂點位移與水花波紋著色器 | 原創 GLSL / Three.js 著色器 | MIT License | 是 | 是 | 是 | 否 | 通過正式驗收 | `src/world/WaterSystem.ts` |
| Kenney 參考風格化模型規範庫 | Kenney.nl | https://kenney.nl/assets | CC0 1.0 Universal | 是 | 是 | 是 | 否 (自願鳴謝) | 參考樣板對齊 | `public/assets/models/` |
| Quaternius 參考卡通動物運動參數 | Quaternius.com | https://quaternius.com/ | CC0 1.0 Universal | 是 | 是 | 是 | 否 (自願鳴謝) | 參考動態對齊 | `public/assets/animations/` |
