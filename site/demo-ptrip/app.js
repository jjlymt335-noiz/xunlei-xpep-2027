(function () {
  'use strict';

  var state = { energy: 'medium', weather: 'sun', time: 120, vibe: 'safe' };
  var missed = [false, false, false];
  var body = document.body;
  var form = document.getElementById('trip-form');
  var timelineNode = document.querySelector('[data-timeline]');
  var summaryNode = document.querySelector('[data-testid="route-summary"]');
  var shareNode = document.querySelector('[data-testid="share-card"]');
  var fallbackNode = document.querySelector('[data-copy-fallback]');

  function recommend(currentState) {
    var weatherLabel = currentState.weather === 'rain' ? '雨天路线' : '晴天路线';
    return [weatherLabel, '旧书店', '雨棚夜市', '20:00 演出'];
  }

  function setScreen(screen) {
    body.dataset.screen = screen;
  }

  function readState() {
    var data = new FormData(form);
    state.energy = data.get('energy');
    state.weather = data.get('weather');
    state.time = Number(data.get('time'));
    state.vibe = data.get('vibe');
  }

  function writeState() {
    Object.keys(state).forEach(function (key) {
      var field = form.querySelector('[name="' + key + '"][value="' + state[key] + '"]');
      if (field) field.checked = true;
    });
  }

  function stop(time, title, meta, fallback, active) {
    return { time: time, title: title, meta: meta, fallback: fallback, active: active };
  }

  function routeCatalog() {
    var fixedShow = stop('20:00–21:30', '演出', '硬约束 · 不可移动', '错过入场准备 → 直接检票入场；20:00 演出不可移动', stop('20:00–21:30', '演出（直接检票）', '硬约束 · 不可移动', '', '备选已启用：直接检票入场。20:00 演出不可移动。'));
    if (state.energy === 'low' && state.weather === 'rain' && state.time === 120) {
      return {
        label: '低电量 / 雨天 / 2 小时',
        gaps: ['17:00–17:15 · 步行 15 分钟到夜市', '18:20–19:35 · 地铁到场馆，预留入场'],
        changedGaps: ['17:05–17:20 · 步行 15 分钟到夜市', '18:25–19:40 · 地铁到场馆，预留入场'],
        stops: [
          stop('16:20–17:00', '旧书店', '阅读 / 40 分钟', '旧书店闭店或迟到 → 5 分钟外的咖啡馆（16:25–17:05）', stop('16:25–17:05', '5 分钟外的咖啡馆', '步行 5 分钟 · 休息 40 分钟', '', '备选已启用：咖啡馆，16:25–17:05。旧书店闭店不影响后续。')),
          stop('17:15–18:20', '雨棚夜市', '逛摊 / 65 分钟', '下雨或错过夜市 → 室内美食广场；若时间不足，直接前往演出场地', stop('17:20–18:20', '室内美食广场', '用餐 / 等雨停', '', '备选已启用：室内美食广场；直接向演出场地靠近。')),
          fixedShow
        ],
        afterFirst: stop('17:20–18:25', '雨棚夜市', '缩短停留 / 65 分钟', '下雨或错过夜市 → 室内美食广场；若时间不足，直接前往演出场地')
      };
    }
    if (state.energy === 'high' && state.weather === 'sun' && state.time === 240) {
      return {
        label: '高精力 / 晴天 / 半天', gaps: ['16:30–16:45 · 步行 15 分钟到市集', '18:15–19:30 · 骑行到场馆，预留入场'], changedGaps: ['16:35–16:50 · 步行 15 分钟到市集', '18:15–19:30 · 骑行到场馆，预留入场'],
        stops: [
          stop('15:30–16:30', '河岸步道', '步行 / 60 分钟', '太晒或走累 → 室内回廊（15:35–16:35）', stop('15:35–16:35', '室内回廊', '避晒步行 / 60 分钟', '', '备选已启用：室内回廊，保留之后的露天市集。')),
          stop('16:45–18:15', '露天市集', '逛摊 / 90 分钟', '收摊或暴晒 → 城市画廊；若来不及，直接前往演出场地', stop('16:50–18:15', '城市画廊', '室内参观 / 85 分钟', '', '备选已启用：城市画廊，仍预留去场馆的时间。')),
          fixedShow
        ]
      };
    }
    if (state.energy === 'medium' && state.weather === 'sun' && state.time === 60) {
      return {
        label: '中等精力 / 晴天 / 1 小时', gaps: ['18:35–18:45 · 步行 10 分钟到场馆', '19:05–19:45 · 入场准备'], changedGaps: ['18:35–18:45 · 步行 10 分钟到场馆', '19:05–19:45 · 入场准备'],
        stops: [
          stop('18:10–18:35', '小型画廊', '可选停留 / 25 分钟', '闭馆或来不及 → 室内回廊（18:10–18:35）', stop('18:10–18:35', '室内回廊', '短步行 / 25 分钟', '', '备选已启用：室内回廊，随后直接到场馆。')),
          stop('18:45–19:05', '直接前往场馆', '检票与取票 / 20 分钟', '道路拥堵 → 地铁一站到场馆', stop('18:45–19:05', '地铁一站到场馆', '替代通勤 / 20 分钟', '', '备选已启用：改乘地铁，演出时间不变。')),
          fixedShow
        ]
      };
    }
    var firstTitle = state.weather === 'rain' ? '街角咖啡馆' : '社区画廊';
    var secondTitle = state.weather === 'rain' ? '室内美食广场' : '晚餐小店';
    return {
      label: '已按当前条件排定', gaps: ['17:10–17:25 · 步行 15 分钟', '18:20–19:35 · 前往场馆'], changedGaps: ['17:10–17:25 · 步行 15 分钟', '18:20–19:35 · 前往场馆'],
      stops: [
        stop('16:30–17:10', firstTitle, '可调整停留 / 40 分钟', '错过这一站 → 室内回廊', stop('16:30–17:10', '室内回廊', '替代停留 / 40 分钟', '', '备选已启用：室内回廊，后续保持可走。')),
        stop('17:25–18:20', secondTitle, '用餐 / 55 分钟', '错过这一站 → 直接前往演出场地', stop('17:25–18:20', '直接前往演出场地', '提前到场 / 55 分钟', '', '备选已启用：提前到场，保留 20:00 演出。')),
        fixedShow
      ]
    };
  }

  function routeStops() {
    var plan = routeCatalog();
    return plan.stops.map(function (item, index) {
      if (missed[index]) return item.active;
      if (index === 1 && missed[0] && plan.afterFirst) return plan.afterFirst;
      return item;
    });
  }

  function gapAfter(index) {
    var plan = routeCatalog();
    return (missed[0] || missed[1] ? plan.changedGaps : plan.gaps)[index];
  }

  function renderTimeline() {
    var stops = routeStops();
    summaryNode.textContent = routeCatalog().label + '：已预留每段移动时间。';
    timelineNode.innerHTML = '';
    stops.forEach(function (stop, index) {
      var item = document.createElement('article');
      var active = missed[index];
      item.className = 'timeline-stop' + (active ? ' is-fallback' : '');
      item.dataset.testid = 'timeline-stop';
      item.innerHTML = '<div class="timeline-time">' + stop.time + '</div><div><h3>' + (index + 1) + '. ' + stop.title + '</h3><p class="stop-meta">' + stop.meta + '</p><p class="fallback" data-testid="stop-fallback">' + (active ? '<strong>' + stop.active + '</strong>' : stop.fallback) + '</p><button class="miss-stop" type="button" data-action="miss-stop" data-stop="' + index + '"' + (active ? ' disabled' : '') + '>' + (active ? '备选已启用' : '我错过了这一站') + '</button></div>';
      timelineNode.appendChild(item);
      if (index < stops.length - 1) {
        var gap = document.createElement('div');
        gap.className = 'travel-gap';
        gap.textContent = gapAfter(index);
        timelineNode.appendChild(gap);
      }
    });
    timelineNode.querySelectorAll('[data-action="miss-stop"]').forEach(function (button) {
      button.addEventListener('click', function () {
        missed[Number(button.dataset.stop)] = true;
        renderTimeline();
      });
    });
  }

  function renderShare() {
    var changes = missed.filter(Boolean).length;
    var names = routeStops().map(function (stop) { return stop.time + ' ' + stop.title; });
    shareNode.innerHTML = '<h3>路线调整记录</h3><ol><li>' + names[0] + '</li><li>' + names[1] + '</li><li>' + names[2] + '</li></ol><p>已启用备选 ' + changes + ' 次；20:00 演出保持不变。</p>';
  }

  function shareTrip() {
    var text = shareNode.innerText;
    fallbackNode.hidden = true;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () { fallbackNode.textContent = text; fallbackNode.hidden = false; });
    } else {
      fallbackNode.textContent = text;
      fallbackNode.hidden = false;
    }
  }

  function initializeCaptureState() {
    var capture = new URLSearchParams(window.location.search).get('state');
    if (!capture || capture === 'setup') return;
    if (capture === 'choices') { setScreen('choices'); return; }
    if (capture === 'planb') {
      state = { energy: 'low', weather: 'rain', time: 120, vibe: 'safe' };
      missed[0] = true;
      writeState();
      renderTimeline();
      setScreen('route');
      return;
    }
    if (capture === 'share') { renderShare(); setScreen('share'); }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    readState();
    missed = [false, false, false];
    renderTimeline();
    setScreen('route');
  });
  document.querySelector('[data-action="open-route"]').addEventListener('click', function () { renderTimeline(); setScreen('route'); });
  document.querySelector('[data-action="back-setup"]').addEventListener('click', function () { writeState(); setScreen('setup'); });
  document.querySelector('[data-action="finish-trip"]').addEventListener('click', function () { renderShare(); setScreen('share'); });
  document.querySelector('[data-action="share-trip"]').addEventListener('click', shareTrip);
  document.querySelector('[data-action="restart"]').addEventListener('click', function () { missed = [false, false, false]; setScreen('setup'); });

  window.TripState = state;
  window.recommend = recommend;
  window.chooseOption = function () { renderTimeline(); setScreen('route'); };
  window.reroute = function (reason) { missed[reason === 'closed' ? 0 : 1] = true; renderTimeline(); setScreen('route'); };
  initializeCaptureState();
}());
