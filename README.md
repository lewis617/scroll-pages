# 吉他谱集合

一个现代化的静态网页应用，用于展示和浏览吉他谱，支持和弦级数转换和自动滚动功能。

## 功能特性

- 📱 响应式设计，支持移动端和桌面端
- 🎸 Ultimate Guitar 格式的吉他谱显示
- 🎵 **智能和弦级数转换** - 自动将和弦转换为罗马数字级数记谱法
- 📜 **自动滚动功能** - 支持可调速的自动滚动，适合练习和表演
- 🎨 现代化的UI设计，带有毛玻璃效果
- ⚡ 使用ES6模块化开发
- 🚀 静态网页，可直接部署到GitHub Pages

## 核心功能详解

### 🎵 和弦级数转换
- **自动识别和弦**：智能解析歌曲中的所有和弦（支持复杂和弦如 maj7、sus4、add4 等）
- **动态级数映射**：根据歌曲调性自动生成和弦到级数的映射关系
- **一键切换**：点击"显示级数"按钮即可在和弦名称和罗马数字级数之间切换
- **支持借用和弦**：处理常见的借用和弦，如 bIII、bVI、bVII、iv 等
- **理论学习**：帮助理解和弦功能和音乐理论

### 📜 自动滚动功能  
- **可调速滚动**：支持多档滚动速度（1x-5x），适应不同演奏需求
- **智能控制**：点击开始/暂停按钮控制滚动，空格键快速切换
- **流畅体验**：平滑滚动算法，不会打断演奏节奏
- **移动端优化**：在移动设备上同样提供优秀的滚动体验

## 技术栈

- HTML5
- CSS3 (使用现代CSS特性如Grid、Flexbox、backdrop-filter)
- JavaScript ES6+ (模块化)
- 静态部署 (GitHub Pages)

## 项目结构

```
.
├── index.html              # 主页面
├── js/
│   ├── app.js             # 主应用逻辑和级数转换算法
│   └── songs/             # 歌曲数据目录
│       ├── index.js       # 歌曲索引
│       ├── stand-by-me.js # 示例歌曲文件
│       └── ...            # 其他歌曲文件
├── styles.css             # 样式文件
└── README.md              # 项目说明
```

## 本地开发

由于使用了ES6模块，需要通过HTTP服务器运行（而不是直接打开HTML文件）：

```bash
# 使用Python 3
python -m http.server 8000

# 使用Node.js (需要安装http-server)
npx http-server

# 使用PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 使用指南

### 基本操作
1. **选择歌曲**：从首页歌曲列表中点击想要查看的歌曲
2. **查看吉他谱**：页面会显示完整的吉他谱内容
3. **返回首页**：点击左上角的返回按钮

### 级数转换功能
1. **启用级数显示**：点击页面上方的"显示级数"按钮
2. **查看级数**：原本的和弦名称会被替换为罗马数字级数
3. **关闭级数显示**：再次点击按钮回到原始和弦显示

### 自动滚动功能
1. **开始滚动**：点击"开始滚动"按钮启动自动滚动
2. **调整速度**：使用速度选择器调整滚动速度（1x-5x）
3. **暂停/继续**：点击"暂停滚动"按钮或按空格键暂停/继续
4. **快捷键**：使用空格键快速切换滚动状态

## 添加新歌曲

### 1. 创建歌曲文件
在 `js/songs/` 目录下创建新的歌曲文件，格式如下：

```javascript
// js/songs/your-song.js
export const song = {
    id: 'your-song',
    title: '歌曲名称',
    artist: '演唱者',
    key: 'C',  // 歌曲调性（重要：用于级数转换）
    content: `
[Verse 1]
C       G       Am      F
歌词内容...

[Chorus]  
F       C       G       Am
更多歌词...
    `
};
```

### 2. 更新歌曲索引
编辑 `js/songs/index.js` 文件，添加新歌曲的导入和导出：

```javascript
import { song as yourSong } from './your-song.js';

export const songs = [
    // ... 其他歌曲
    yourSong,
];
```

### 3. 注意事项
- **调性设置**：确保 `key` 字段正确，这是级数转换的基础
- **和弦格式**：使用标准和弦记谱法（如 C、Am、F、G7、Cmaj7 等）
- **文件命名**：使用小写字母和连字符，如 `my-song.js`

## GitHub Pages 部署

1. 推送代码到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支（通常是main或gh-pages）
4. 访问提供的URL即可

## 当前收录歌曲

- Stand by Me - Ben E. King
- Yellow - Coldplay  
- Don't Look Back in Anger - Oasis
- Goodbye to Romance - Ozzy Osbourne
- Can't Take My Eyes Off You - Frankie Valli

## 级数转换支持

本项目支持以下调性的智能级数转换：
- **大调**：C, G, D, A, E, B, F#, C#, F, Bb, Eb, Ab, Db
- **小调**：Am, Em, Bm, F#m, C#m, G#m, D#m, A#m, Dm, Gm, Cm, Fm, Bbm

支持的和弦类型：
- 基本三和弦：major, minor, diminished
- 七和弦：7, maj7, m7, dim7
- 挂留和弦：sus2, sus4
- 加音和弦：add2, add4, add9
- 借用和弦：bIII, bVI, bVII, iv 等

## 许可证

MIT License