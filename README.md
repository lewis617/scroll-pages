# scroll-pages
滚动的页面（用于吉他谱等网页自动滚动）

<input type="text" placeholder="输入网址" id="urlInput">
<button onclick="enterScrollPage()">开始滚动</button>
<ol>
  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/green_day/last_night_on_earth_chords_824961">last night on earth</a>
  </li>
  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/the_calling/wherever_you_will_go_chords_37465">wherever you will go</a>
  </li>
  <li>
    <a href="page.html?p=http://m.jitaba.cn/view.php?aid=5978">better man</a>
  </li>
  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/the_rolling_stones/as_tears_go_by_chords_346586">as tears go by</a>
  </li>
  <li>
    <a href="page.html?p=http://www.ccguitar.cn/wy_html/6438.htm">wonderful tonight</a>
  </li>
  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/josh_groban/you_raise_me_up_chords_355090">you raise me up</a>
  </li>

  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/ozzy_osbourne/goodbye_to_romance_chords_1130955">goodbye_to_romance</a>
  </li>
  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/misc_traditional/home_on_the_range_chords_1726287">home_on_the_range</a>
  </li>
  <li>
    <a href="page.html?p=https://tabs.ultimate-guitar.com/tab/coldplay/yellow_chords_540497">yellow</a>
  </li>
</ol>
<script>
  function enterScrollPage() {
    var url = document.querySelector('#urlInput').value;
    location = 'page.html?p=' + url;
  }
</script>
