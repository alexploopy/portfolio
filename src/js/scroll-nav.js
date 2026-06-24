// Navigate to the next/prev page on a deliberate mouse-wheel gesture at the
// bottom/top edge: Lethargy tells a real scroll from an inertial tail, plus a
// minimum dwell at the edge, so one scroll = one page.
// This gesture nav is DESKTOP-ONLY: it's gated off on mobile — a touch device
// OR a viewport <= 640px wide (see isMobile). There the chevron at the bottom
// still works as a plain tap/click link to the next page; only the gesture is
// disabled. Also inert anywhere no wheel fires.
(function () {
  var body = document.body;
  var nextUrl = body.dataset.scrollNext || "";
  var prevUrl = body.dataset.scrollPrev || "";
  if (!nextUrl && !prevUrl) return;

  var EDGE_PX = 25; // px tolerance for "at the edge"
  var EDGE_DELAY_MS = 200; // minimum dwell at the edge before a wheel scroll advances
  var TOP_LOCK_IDLE_MS = 50; // release the on-load lock this long after input stops
  var TOP_LOCK_MAX_MS = 1500; // hard cap on the on-load lock

  var navigating = false;
  var lethargy = typeof Lethargy !== "undefined" ? new Lethargy() : null;
  var bottomSince = 0; // when the bottom edge was reached (0 = not at bottom)
  var topSince = 0; // when the top edge was reached (0 = not at top)
  var locked = false; // briefly true after arriving via a scroll-nav (see below)

  function atBottom() {
    var y = window.scrollY || window.pageYOffset;
    return y + window.innerHeight >= document.documentElement.scrollHeight - EDGE_PX;
  }
  function atTop() {
    return (window.scrollY || window.pageYOffset) <= EDGE_PX;
  }

  // "Mobile" = a coarse/touch pointer OR a phone-width viewport (matching the
  // 640px breakpoint the CSS uses for its mobile layout). The scroll-to-navigate
  // gesture is disabled there.
  function isMobile() {
    var mm = window.matchMedia;
    var coarse = !!(mm && mm("(pointer: coarse)").matches);
    var narrow = !!(mm && mm("(max-width: 640px)").matches);
    var touch = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
    return coarse || narrow || touch;
  }

  function go(url) {
    if (!url || navigating) return;
    navigating = true;
    // Mark that the NEXT page is being entered via a scroll, so it can absorb the
    // leftover momentum of this gesture.
    try {
      sessionStorage.setItem("scrollNavPending", "1");
    } catch (err) {}
    window.location.assign(url);
  }

  // Shared navigation entry point. dir < 0 -> next page, dir > 0 -> previous.
  function navigate(dir) {
    if (navigating || locked) return;
    if (dir < 0 && nextUrl) go(nextUrl);
    else if (dir > 0 && prevUrl) go(prevUrl);
  }

  // Absorb leftover momentum from the scroll that navigated here: if we arrived
  // via a scroll-triggered navigation, lock scrolling at the top until input
  // settles, so a hard scroll doesn't carry the new page down before you can see
  // the top. Standard scroll-lock; passive listeners can't preventDefault, so the
  // lock uses non-passive ones. Normal link clicks set no flag => no lock.
  (function () {
    var fromScrollNav = false;
    try {
      fromScrollNav = sessionStorage.getItem("scrollNavPending") === "1";
      sessionStorage.removeItem("scrollNavPending");
    } catch (err) {}
    if (!fromScrollNav) return;

    locked = true;
    window.scrollTo(0, 0);
    var releaseTimer = null;
    function unlock() {
      if (!locked) return;
      locked = false;
      clearTimeout(releaseTimer);
      window.removeEventListener("wheel", lockHandler, { passive: false });
      window.removeEventListener("touchmove", lockHandler, { passive: false });
    }
    function lockHandler(e) {
      if (!locked) return;
      e.preventDefault(); // block native scroll, including momentum
      window.scrollTo(0, 0); // stay pinned at the top
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(unlock, TOP_LOCK_IDLE_MS); // release once it settles
    }
    window.addEventListener("wheel", lockHandler, { passive: false });
    window.addEventListener("touchmove", lockHandler, { passive: false });
    setTimeout(unlock, TOP_LOCK_MAX_MS); // hard cap so it always releases
  })();

  // Show the chevron only when the bottom of the page is actually in view (no
  // more normal scrolling left). A bottom sentinel watched by IntersectionObserver
  // (async, no scroll-event thrashing). The chevron defaults to visible in CSS,
  // so this only HIDES it away from the bottom — keeping the no-JS link working.
  var indicator = document.querySelector(".scroll-indicator");
  if (indicator) {
    indicator.classList.toggle("is-hidden", !atBottom());
    if ("IntersectionObserver" in window) {
      var sentinel = document.createElement("div");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText = "width:100%;height:1px;";
      document.body.appendChild(sentinel);
      new IntersectionObserver(
        function (entries) {
          indicator.classList.toggle("is-hidden", !entries[0].isIntersecting);
        },
        { rootMargin: "0px 0px 24px 0px" }
      ).observe(sentinel);
    }
  }

  // From here down is the scroll-to-navigate gesture itself. It's desktop-only:
  // gated off on mobile (touch device or narrow viewport). The chevron above
  // stays a working tap link, so mobile keeps a way forward — just not a gesture.
  if (isMobile()) return;

  // ---- Desktop: mouse wheel ----
  // Seed the edge timers from page load so a page that opens already at an edge
  // (e.g. a short page) counts the time you've been there.
  var startTs = window.performance && performance.now ? performance.now() : 0;
  if (atBottom()) bottomSince = startTs;
  if (atTop()) topSince = startTs;

  window.addEventListener(
    "wheel",
    function (e) {
      if (navigating || locked) return;

      var now = e.timeStamp || 0;

      // Track when each edge was first reached; reset on leaving it. Minimum-pause
      // mechanism (fullPage.js scrollOverflowEndPrevent.delay): a scroll-through
      // that reaches the bottom can't advance until EDGE_DELAY_MS has passed.
      if (atBottom()) {
        if (!bottomSince) bottomSince = now;
      } else {
        bottomSince = 0;
      }
      if (atTop()) {
        if (!topSince) topSince = now;
      } else {
        topSince = 0;
      }

      // Lethargy: 1 = intentional scroll up, -1 = intentional scroll down,
      // false = inertial/momentum (ignored). Fallback to raw direction if absent.
      var dir = lethargy
        ? lethargy.check(e)
        : e.deltaY > 0
        ? -1
        : e.deltaY < 0
        ? 1
        : false;
      if (!dir) return;

      if (dir === -1 && bottomSince && now - bottomSince >= EDGE_DELAY_MS) {
        navigate(-1);
      } else if (dir === 1 && topSince && now - topSince >= EDGE_DELAY_MS) {
        navigate(1);
      }
    },
    { passive: true }
  );
})();
