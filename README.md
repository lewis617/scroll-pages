# 吉他谱集合

一个简洁的静态网页，用于展示和浏览吉他谱。

## 功能特性

- 📱 响应式设计，支持移动端和桌面端
- 🎸 Ultimate Guitar 格式的吉他谱显示
- 🎨 现代化的UI设计，带有毛玻璃效果
- ⚡ 使用ES6模块化开发
- 🚀 静态网页，可直接部署到GitHub Pages

## 技术栈

- HTML5
- CSS3 (使用现代CSS特性如Grid、Flexbox、backdrop-filter)
- JavaScript ES6+ (模块化)
- 静态部署 (GitHub Pages)

## 项目结构

```
.
├── index.html          # 主页面
├── app.js             # 主应用逻辑 (ES6 Module)
├── songs.js           # 吉他谱数据存储 (ES6 Module)
├── styles.css         # 样式文件
└── README.md          # 项目说明
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

## 添加新歌曲

编辑 `songs.js` 文件，在 `songs` 数组中添加新的歌曲对象：

```javascript
{
  id: 'unique-song-id',
  title: '歌曲名称',
  artist: '演唱者',
  content: `吉他谱内容...`
}
```

## GitHub Pages 部署

1. 推送代码到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支（通常是main或gh-pages）
4. 访问提供的URL即可

## 当前收录歌曲

- Stand by Me - Ben E. King

## 许可证

MIT License