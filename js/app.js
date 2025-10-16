// app.js - 主应用逻辑
import { songs } from './songs-index.js';

class GuitarChartApp {
    constructor() {
        this.currentView = 'list';
        this.scrolling = false;
        this.scrollSpeed = 1; // 保持1.0x显示
        this.scrollInterval = null;
        this.showingNumerals = false; // 是否显示级数
        this.currentSong = null; // 当前歌曲
        this.originalContent = ''; // 原始和弦内容
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

        backBtn.addEventListener('click', () => this.showSongsList());
        playPauseBtn.addEventListener('click', () => this.toggleScroll());
        speedUpBtn.addEventListener('click', () => this.changeSpeed(0.2));
        slowDownBtn.addEventListener('click', () => this.changeSpeed(-0.2));
        chordToggleBtn.addEventListener('click', () => this.toggleChordDisplay());
        
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
        
        songsListElement.innerHTML = '';
        
        songs.forEach(song => {
            const songCard = this.createSongCard(song);
            songsListElement.appendChild(songCard);
        });
    }

    createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
            <p>调性: ${song.key || '未知'}</p>
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
        songContentElement.textContent = song.content;
        
        // 重置和弦显示状态
        this.showingNumerals = false;
        chordToggleBtn.textContent = '级数';
        chordToggleBtn.classList.remove('active');
        
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
        }, 1000);
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
        if (!this.currentSong) return;
        
        const chordToggleBtn = document.getElementById('chordToggleBtn');
        const songContentElement = document.getElementById('songContent');
        
        this.showingNumerals = !this.showingNumerals;
        
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
        
        // 使用正则表达式匹配和弦
        // 匹配常见的和弦格式：大写字母开头，可能包含#、b、m、7、maj7等
        // 使用前后断言避免单词边界问题，确保正确匹配带#b的和弦
        const chordRegex = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][#b]?)?)(?![A-Za-z#b])/g;
        
        return content.replace(chordRegex, (match, chord) => {
            const numeral = chordToNumeral[chord];
            return numeral || match; // 如果找不到对应的级数，保持原和弦
        });
    }

    getChordToNumeralMapping(key) {
        // 十二平均律的音名顺序（包含升降号）
        const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const flatScale = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        
        // 处理调号的映射
        const keyNormalization = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
        };
        
        const normalizedKey = keyNormalization[key] || key;
        const keyIndex = chromaticScale.indexOf(normalizedKey);
        
        if (keyIndex === -1) return {};
        
        // 大调音阶的音程关系（半音数）
        const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
        
        // 计算当前调的音阶
        const scaleNotes = majorScaleIntervals.map(interval => {
            const noteIndex = (keyIndex + interval) % 12;
            return chromaticScale[noteIndex];
        });
        
        // 判断使用升号还是降号系统
        const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(key);
        const noteNames = useFlats ? flatScale : chromaticScale;
        
        const mapping = {};
        
        // 自然音级的级数表示
        const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
        const minorNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
        
        // 生成基本三和弦
        scaleNotes.forEach((note, index) => {
            const numeral = numerals[index];
            const isMinor = [1, 2, 5].includes(index); // ii, iii, vi 是小调和弦
            const isDim = index === 6; // vii° 是减和弦
            
            // 获取在当前调系统中的正确音名表示
            const correctNote = this.getNoteInKeySystem(note, useFlats);
            
            if (isDim) {
                mapping[correctNote + 'dim'] = numeral;
            } else if (isMinor) {
                mapping[correctNote + 'm'] = numeral;
                mapping[correctNote + 'm7'] = numeral + '7';
                mapping[correctNote + 'madd4'] = numeral + 'add4'; // 小调add4
            } else {
                mapping[correctNote] = numeral;
                mapping[correctNote + '7'] = numeral + '7';
                mapping[correctNote + 'maj7'] = numeral + 'maj7';
                mapping[correctNote + 'sus4'] = numeral + 'sus4';
                mapping[correctNote + 'add4'] = numeral + 'add4'; // 大调add4
            }
        });
        
        // 添加变化音和弦（借调和弦）
        this.addAlteratedChords(mapping, keyIndex, useFlats);
        
        return mapping;
    }
    
    getNoteInKeySystem(note, useFlats) {
        const sharpToFlat = {
            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
        };
        const flatToSharp = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
        };
        
        if (useFlats && sharpToFlat[note]) {
            return sharpToFlat[note];
        } else if (!useFlats && flatToSharp[note]) {
            return flatToSharp[note];
        }
        return note;
    }
    
    addAlteratedChords(mapping, keyIndex, useFlats) {
        const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // 常见的变化音级数对应关系（相对于主音的半音距离）
        const alteratedChords = [
            { interval: 3, numeral: 'bIII' },    // 降三级
            { interval: 8, numeral: 'bVI' },     // 降六级  
            { interval: 10, numeral: 'bVII' },   // 降七级
        ];
        
        alteratedChords.forEach(({ interval, numeral }) => {
            const noteIndex = (keyIndex + interval) % 12;
            const note = this.getNoteInKeySystem(chromaticScale[noteIndex], useFlats);
            
            if (numeral === 'bIII') {
                mapping[note] = numeral;
                mapping[note + '7'] = numeral + '7';
                mapping[note + 'maj7'] = numeral + 'maj7';
            } else if (numeral === 'bVI') {
                mapping[note] = numeral;
                mapping[note + '7'] = numeral + '7';
                mapping[note + 'maj7'] = numeral + 'Maj7';
            } else if (numeral === 'bVII') {
                mapping[note] = numeral;
                mapping[note + '7'] = numeral + '7';
            }
        });
        
        // 添加主调小调形式 (i)
        const tonicNote = this.getNoteInKeySystem(chromaticScale[keyIndex], useFlats);
        mapping[tonicNote + 'm'] = 'i';
        mapping[tonicNote + 'm7'] = 'im7';
        
        // 添加自然音级的小调形式（借用平行小调）
        const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
        majorScaleIntervals.forEach((interval, index) => {
            const noteIndex = (keyIndex + interval) % 12;
            const note = this.getNoteInKeySystem(chromaticScale[noteIndex], useFlats);
            const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
            
            // 为自然音级添加小调形式和属七和弦
            if (index === 2) { // III级：添加大调属七和弦 (III7)
                mapping[note + '7'] = 'III7';
            } else if (index === 3) { // IV级：添加小调形式 (iv)
                mapping[note + 'm'] = 'iv';
                mapping[note + 'm7'] = 'ivm7';
            } else if (index === 4) { // V级：添加小调形式 (v)
                mapping[note + 'm'] = 'v';
                mapping[note + 'm7'] = 'vm7';
            }
        });
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GuitarChartApp();
});