// app.js - 主应用逻辑
import { songs } from './songs-index.js';

class GuitarChartApp {
    constructor() {
        this.currentView = 'list';
        this.scrolling = false;
        this.scrollSpeed = 1; // 保持1.0x显示
        this.scrollInterval = null;
        this.showingNumerals = true; // 是否显示级数
        this.currentSong = null; // 当前歌曲
        this.originalContent = ''; // 原始和弦内容
        this.currentFilter = ''; // 当前筛选的标签
        this.init();
    }

    init() {
        this.bindEvents();
        // 检查URL参数，如果有歌曲ID则显示对应歌曲，否则显示列表
        this.handleInitialRoute();
    }

    handleInitialRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const songId = urlParams.get('song');
        
        if (songId) {
            const song = this.findSongById(songId);
            if (song) {
                this.showSong(song, false); // false表示不更新URL
                return;
            }
        }
        
        // 如果没有找到歌曲或没有songId参数，显示列表
        this.renderSongsList();
    }

    findSongById(songId) {
        return songs.find(song => this.generateSongId(song) === songId);
    }

    generateSongId(song) {
        // 生成基于歌曲标题和艺术家的唯一ID
        return encodeURIComponent(`${song.title}-${song.artist}`.replace(/\s+/g, '-').toLowerCase());
    }

    updateURL(songId) {
        const newURL = songId ? 
            `${window.location.pathname}?song=${songId}` : 
            window.location.pathname;
        window.history.pushState(null, '', newURL);
    }

    bindEvents() {
        const backBtn = document.getElementById('backBtn');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const speedUpBtn = document.getElementById('speedUpBtn');
        const slowDownBtn = document.getElementById('slowDownBtn');
        const chordToggleBtn = document.getElementById('chordToggleBtn');
        const tagFilter = document.getElementById('tagFilter');

        backBtn.addEventListener('click', () => this.showSongsList());
        playPauseBtn.addEventListener('click', () => this.toggleScroll());
        speedUpBtn.addEventListener('click', () => this.changeSpeed(0.2));
        slowDownBtn.addEventListener('click', () => this.changeSpeed(-0.2));
        chordToggleBtn.addEventListener('click', () => this.toggleChordDisplay());
        tagFilter.addEventListener('change', (e) => this.filterSongs(e.target.value));
        
        // 处理浏览器的后退/前进按钮
        window.addEventListener('popstate', () => {
            this.handleInitialRoute();
        });
    }

    renderSongsList() {
        const songsListView = document.getElementById('songsListView');
        const songsListElement = document.getElementById('songsList');
        const songDisplayElement = document.getElementById('songDisplay');
        
        // 隐藏歌曲显示，显示歌曲列表
        songDisplayElement.style.display = 'none';
        songsListView.style.display = 'block';
        
        // 停止滚动
        this.stopScroll();
        
        // 初始化筛选器
        this.initializeTagFilter();
        
        // 渲染歌曲列表
        this.renderFilteredSongs();
    }

    initializeTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        
        // 收集所有唯一的标签
        const allTags = new Set();
        songs.forEach(song => {
            if (song.tags && Array.isArray(song.tags)) {
                song.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        // 清空并重新填充筛选器选项
        tagFilter.innerHTML = '<option value="">全部歌曲</option>';
        
        // 为每个标签添加选项
        Array.from(allTags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
        
        // 设置当前筛选值
        tagFilter.value = this.currentFilter;
    }



    filterSongs(tag) {
        this.currentFilter = tag;
        this.renderFilteredSongs();
    }

    renderFilteredSongs() {
        const songsListElement = document.getElementById('songsList');
        songsListElement.innerHTML = '';
        
        // 根据筛选条件过滤歌曲
        const filteredSongs = this.currentFilter ? 
            songs.filter(song => song.tags && song.tags.includes(this.currentFilter)) :
            songs;
        
        // 渲染筛选后的歌曲
        filteredSongs.forEach(song => {
            const songCard = this.createSongCard(song);
            songsListElement.appendChild(songCard);
        });
        
        // 如果没有找到歌曲，显示提示
        if (filteredSongs.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <p>没有找到带有 "${this.currentFilter}" 标签的歌曲</p>
            `;
            songsListElement.appendChild(noResultsDiv);
        }
    }

    createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        
        // 创建标签HTML
        let tagsHtml = '';
        if (song.tags && song.tags.length > 0) {
            tagsHtml = `
                <div class="song-tags">
                    ${song.tags.map(tag => `<span class="song-tag ${tag}">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        card.innerHTML = `
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
            <p>调性: ${song.key || '未知'}</p>
            ${tagsHtml}
            <p>点击查看吉他谱</p>
        `;
        
        card.addEventListener('click', () => this.showSong(song, true)); // true表示更新URL
        
        return card;
    }

    showSong(song, updateURL = true) {
        const songsListView = document.getElementById('songsListView');
        const songDisplayElement = document.getElementById('songDisplay');
        const songTitleElement = document.getElementById('songTitle');
        const songKeyInfoElement = document.getElementById('songKeyInfo');
        const songContentElement = document.getElementById('songContent');
        const chordToggleBtn = document.getElementById('chordToggleBtn');
        
        // 隐藏歌曲列表，显示歌曲内容
        songsListView.style.display = 'none';
        songDisplayElement.style.display = 'block';
        
        // 保存当前歌曲和原始内容
        this.currentSong = song;
        this.originalContent = song.content;
        
        // 设置歌曲信息
        songTitleElement.textContent = `${song.title} - ${song.artist}`;
        songKeyInfoElement.textContent = `调性: ${song.key || '未知'}`;
        
        // 默认显示级数
        this.showingNumerals = true;
        this.renderChordDisplay();
        
        // 重置滚动状态
        this.stopScroll();
        this.scrollSpeed = 1; // 重置为1.0x显示
        this.updateSpeedDisplay();
        
        // 滚动到顶部
        songContentElement.scrollTop = 0;
        
        this.currentView = 'song';
        
        // 更新URL
        if (updateURL) {
            const songId = this.generateSongId(song);
            this.updateURL(songId);
        }
    }

    showSongsList() {
        this.stopScroll();
        this.renderSongsList();
        this.currentView = 'list';
        // 清除URL参数
        this.updateURL(null);
    }

    toggleScroll() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const songContent = document.getElementById('songContent');
        
        if (this.scrolling) {
            this.stopScroll();
            playPauseBtn.textContent = '▶';
            playPauseBtn.classList.remove('playing');
        } else {
            this.startScroll();
            playPauseBtn.textContent = '⏸';
            playPauseBtn.classList.add('playing');
        }
    }

    startScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
        }
        
        const songContent = document.getElementById('songContent');
        this.scrolling = true;
        
        this.scrollInterval = setInterval(() => {
            if (songContent.scrollTop < songContent.scrollHeight - songContent.clientHeight) {
                // 使用2作为基础速度，让1.0x更慢
                songContent.scrollTop += (this.scrollSpeed * 2);
            } else {
                // 滚动到底部后停止
                this.stopScroll();
                const playPauseBtn = document.getElementById('playPauseBtn');
                playPauseBtn.textContent = '▶';
                playPauseBtn.classList.remove('playing');
            }
        }, 500);
    }

    stopScroll() {
        this.scrolling = false;
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    changeSpeed(delta) {
        this.scrollSpeed = Math.max(0.2, Math.min(3, this.scrollSpeed + delta));
        this.updateSpeedDisplay();
    }

    updateSpeedDisplay() {
        const speedDisplay = document.getElementById('speedDisplay');
        speedDisplay.textContent = `速度: ${this.scrollSpeed.toFixed(1)}x`;
    }

    toggleChordDisplay() {
        this.showingNumerals = !this.showingNumerals;
        this.renderChordDisplay();
    }

    renderChordDisplay() {
        if (!this.currentSong) return;
        
        const chordToggleBtn = document.getElementById('chordToggleBtn');
        const songContentElement = document.getElementById('songContent');
        
        if (this.showingNumerals) {
            // 转换为级数显示
            const numeralContent = this.convertChordsToNumerals(this.originalContent, this.currentSong.key);
            songContentElement.textContent = numeralContent;
            chordToggleBtn.textContent = '和弦';
            chordToggleBtn.classList.add('active');
        } else {
            // 显示原始和弦
            songContentElement.textContent = this.originalContent;
            chordToggleBtn.textContent = '级数';
            chordToggleBtn.classList.remove('active');
        }
    }

    convertChordsToNumerals(content, key) {
        if (!key) return content;
        
        // 定义各调的和弦对应的级数
        const chordToNumeral = this.getChordToNumeralMapping(key);
        
        // 按行处理
        const lines = content.split('\n');
        const processedLines = lines.map(line => {
            // 检查是否为六线谱行
            // 六线谱特征：连续的 "-" 和数字组合
            const isTabLine =  /[-]{3,}/.test(line) || /\|.*[-\d].*\|/.test(line);
            
            if (isTabLine) {
                // 如果是六线谱行，直接返回原行
                return line;
            }
            
            // 使用正则表达式匹配和弦
            // 匹配常见的和弦格式：大写字母开头，可能包含#、b、m、7、maj7等
            const chordRegex = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][#b]?)?)(?![A-Za-z#b])/g;
            
            return line.replace(chordRegex, (match, chord) => {
                const numeral = chordToNumeral[chord];
                return numeral || match; // 如果找不到对应的级数，保持原和弦
            });
        });
        
        return processedLines.join('\n');
    }

    getChordToNumeralMapping(key) {
        // 十二平均律的音名顺序
        const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const flatScale = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        
        // 处理调号的映射
        const keyNormalization = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
        };
        
        let normalizedKey = key;
        // 如果是小调 (例如 Bm), 自动转换为其关系大调 (例如 D)
        if (key.endsWith('m') && key.length > 1) {
            const minorRoot = key.slice(0, -1);
            const normalizedMinorRoot = keyNormalization[minorRoot] || minorRoot;
            const minorIndex = chromaticScale.indexOf(normalizedMinorRoot);
            if (minorIndex !== -1) {
                normalizedKey = chromaticScale[(minorIndex + 3) % 12];
            }
        } else {
            normalizedKey = keyNormalization[key] || key;
        }
        
        const keyIndex = chromaticScale.indexOf(normalizedKey);
        
        if (keyIndex === -1) return {};
        
        // 级数表示（大调）
        const numerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
        
        const mapping = {};
        
        // 为所有12个半音建立映射关系
        for (let i = 0; i < 12; i++) {
            const noteIndex = (keyIndex + i) % 12;
            const sharpNote = chromaticScale[noteIndex];
            const flatNote = flatScale[noteIndex];
            const numeral = numerals[i];
            
            // 为升号和降号版本都创建映射
            const notesToMap = sharpNote === flatNote ? [sharpNote] : [sharpNote, flatNote];
            
            notesToMap.forEach(note => {
                // 基础和弦
                mapping[note] = numeral;
                // 小调
                mapping[note + 'm'] = numeral.toLowerCase();
                // 属七和弦
                mapping[note + '7'] = numeral + '7';
                // 小七和弦
                mapping[note + 'm7'] = numeral.toLowerCase() + '7';
                // 大七和弦
                mapping[note + 'maj7'] = numeral + 'maj7';
                // sus4和弦
                mapping[note + 'sus4'] = numeral + 'sus4';
                // add和弦
                mapping[note + 'add9'] = numeral + 'add9';
                mapping[note + 'add4'] = numeral + 'add4';
                // 减和弦
                mapping[note + 'dim'] = numeral + 'dim';
                mapping[note + 'dim7'] = numeral + 'dim7';
                // 增和弦
                mapping[note + 'aug'] = numeral + 'aug';
                // 九和弦
                mapping[note + '9'] = numeral + '9';
                mapping[note + 'm9'] = numeral.toLowerCase() + '9';
                // 十一和弦
                mapping[note + '11'] = numeral + '11';
                mapping[note + 'm11'] = numeral.toLowerCase() + '11';
                // 十三和弦
                mapping[note + '13'] = numeral + '13';
                // 特殊和弦
                if (note === 'F#') {
                    mapping['F#13'] = numeral + '13';
                }
            });
        }
        
        return mapping;
}
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GuitarChartApp();
});