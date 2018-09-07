// Load our lazy CSS
(() => {
  const noscriptEl = document.querySelector('#lazyload-css');
  document.head.insertAdjacentHTML('beforeend', noscriptEl.textContent);
})();


// Lazy load images
(() => {
  const imagesToLoad = [];
  const loadImages = () => {
    const elements = document.querySelectorAll('.lazyload-image');
    Array.prototype.forEach.call(elements, el => {
      imagesToLoad.push(new Promise(r => {
        const content = el.textContent;
        el.insertAdjacentHTML('afterend', content);
          const addedImg = el.nextSibling;
          addedImg.style.display = 'none';
          addedImg.addEventListener('load', () => {
            requestAnimationFrame(() => {
              addedImg.style.display = '';
              addedImg.nextSibling.remove();
              el.remove();
              r();
            });
          }, { once: true });
        }));
      });
    Promise.all(imagesToLoad).then(() =>
      window.dispatchEvent(new CustomEvent('fullimagesloaded')));
  };
  document.readyState === 'complete' ?
    loadImages() :
    window.addEventListener('load', loadImages, { once: true });
})();


// Waterfall header
(() => {
  const headerEl = document.querySelector('header');

  let tickingTransparent = false,
      tickingOpaque = false,
      isHeaderTransparent = false;

  const toggleWaterfall = function() {
    const shouldHeaderTransparent = window.scrollY < 50
    if (isHeaderTransparent === shouldHeaderTransparent) return;
    if (shouldHeaderTransparent && !tickingTransparent) {
      tickingTransparent = true;
      requestAnimationFrame(() => {
        headerEl.classList.add('hw-resting');
        isHeaderTransparent = true;
        tickingTransparent = false;
      });
    } else if (!tickingOpaque) {
      tickingOpaque = true;
      requestAnimationFrame(() => {
        headerEl.classList.remove('hw-resting');
        isHeaderTransparent = false;
        tickingOpaque = false;
      });
    }
  }

  window.addEventListener('scroll', toggleWaterfall, { passive: true });

  headerEl.classList.add('header-waterfall');
  toggleWaterfall();
})();


// Select sections (progressive enchantment)
(() => {
  if (!('IntersectionObserver' in window)) return;

  let currentSection = 'showcase',
      currentSectionA = null;

  const thresholds = [];
  for (let i = 0; i < 100; i++)
    thresholds.push((1*100 - i)/100);
  thresholds.push(0);

  const IObserver = new IntersectionObserver(entries => {
    let biggestRatio = 0,
        biggestSection = currentSection;
    entries.forEach(entry => {
      if (entry.intersectionRatio > biggestRatio) {
        biggestRatio = entry.intersectionRatio;
        biggestSection = entry.target.id;
      }
    });
    if (biggestSection === currentSection) return;
    const newSectionA = document.querySelector(`a[href="#${biggestSection}"]`);
    requestAnimationFrame(() => {
      if (newSectionA) newSectionA.classList.add('active');
      if (currentSectionA) currentSectionA.classList.remove('active');
      currentSection = biggestSection;
      currentSectionA = newSectionA;
    });
  }, {
    threshold: thresholds.reverse()
  });

  const sectionsList = document.querySelectorAll('section');
  Array.prototype.forEach.call(sectionsList, el => IObserver.observe(el));
})();


// Circle through highlights
(() => {
  const SHOWCASE_WIDTH = 280;
  const items = document.querySelectorAll('#carousel > .showcase'),
        carousel = document.querySelector('#carousel');

  let currentProminent = 0,
      ticker,
      programScrollOccuring = false;

  function scrollShowcaseIntoView(index) {
    return new Promise(r => {
      const lastIndex = items.length - 1,
            itemOffset = SHOWCASE_WIDTH * (index === lastIndex ? lastIndex : index);
      carousel.style.transition = 'transform 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        carousel.style.transform = `translateX(-${itemOffset}px)`;
        carousel.addEventListener('transitionend', function handleReset(e) {
          if (e.target !== carousel) return;
          carousel.style.transition = '';
          r();
          carousel.removeEventListener('transitionend', handleReset);
        });
      }));
    });
  }

  function isOverflowing() {
    const boxWidth = SHOWCASE_WIDTH * items.length,
          windowWidth = window.innerWidth;
    return boxWidth > windowWidth;
  }
  
  function prominentChanged(newProminent) {
    requestAnimationFrame(() => {
      items[currentProminent].classList.remove('prominent');
      items[newProminent].classList.add('prominent');
      currentProminent = newProminent;
    });

    if (isOverflowing()) {
      if ('IntersectionObserver' in window) {
        programScrollOccuring = true;
        scrollShowcaseIntoView(newProminent)
          .then(() => programScrollOccuring = false);
      } else {
        if (manualInViewCheck(carousel)) {
          programScrollOccuring = true;
          scrollShowcaseIntoView(newProminent)
            .then(() => programScrollOccuring = false);
        }
      }
    }
  }
  
  function next() {
    const newProminent = items.length - 1 <= currentProminent ?
      0 : currentProminent + 1;
    prominentChanged(newProminent);
  }
  function previous() {
    const newProminent =  0 >= currentProminent ?
      items.length - 1 : currentProminent - 1;
    prominentChanged(newProminent);
  }

  // Don't circle when out of view (progressive enchantment)
  function manualInViewCheck(el) {
    const { bottom, top } = el.getBoundingClientRect();
    return !(bottom <= 0 && top <= 0);
  }
  document.addEventListener('visibilitychange',() => {
    document.visibilityState == 'hidden' && (manualInViewCheck(carousel) ?
      clearInterval(ticker) : ticker = setInterval(next, 5000));
  });
  if ('IntersectionObserver' in window) {
    const IObserver = new IntersectionObserver(entries => {
      entries[0].isIntersecting ?
        ticker = setInterval(next, 5000) : clearInterval(ticker);
    });
    IObserver.observe(carousel);
  } else
    ticker = setInterval(next, 5000);

  // Select showcase when user scrolls horizontally
  let wheelHandlerTicker;
  let touchHandlerCords;
  const gestures = {
    touchstart(e) {
      touchHandlerCords = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startScroll:
          carousel.style.transform ? Number(carousel.style.transform.match(/-?\d+/)[0]) : 0,
        maxScroll: SHOWCASE_WIDTH * (items.length - 1)
      };
      clearTimeout(ticker);
    },
    touchmove(e) {
      if (!touchHandlerCords) return;
      const swipeDistance = {
        x: e.touches[0].clientX - touchHandlerCords.x,
        y: e.touches[0].clientY - touchHandlerCords.y
      };
      if (Math.abs(swipeDistance.x) > Math.abs(swipeDistance.y)) {
        e.preventDefault();
        let currentScroll = touchHandlerCords.startScroll + swipeDistance.x;
        if (Math.abs(currentScroll) > touchHandlerCords.maxScroll)
          currentScroll = touchHandlerCords.maxScroll * -1;
        if (currentScroll > 0)
          currentScroll = 0;
        carousel.style.transform = `translateX(${currentScroll}px)`;
        touchHandlerCords.lastScroll = currentScroll;
      }
    },
    touchend(e) {
      if (touchHandlerCords) {
        let scrollCounter = Math.abs(touchHandlerCords.lastScroll);
        let i = 0;
        while (scrollCounter > SHOWCASE_WIDTH) {
          scrollCounter -= SHOWCASE_WIDTH;
          i++;
        }
        if (scrollCounter < SHOWCASE_WIDTH * 0.4 && i > 0) i--;
        if (scrollCounter > SHOWCASE_WIDTH * 0.6 && i < items.length - 1) i++;
        prominentChanged(i);
        touchHandlerCords = null;
      }
      ticker = setTimeout(next, 5000);
    },
    wheel(e) {
      if (e.deltaX !== 0) e.preventDefault();
      if (wheelHandlerTicker) {
        clearTimeout(wheelHandlerTicker);
        clearTimeout(ticker);
      }
      wheelHandlerTicker = setTimeout(() => {
        if (e.deltaX > 0) next();
        if (e.deltaX < 0) previous();
        ticker = setInterval(next, 5000);
      }, 500);
    }
  }
  function handleResize() {
    if (isOverflowing()) {
      carousel.addEventListener('touchstart', gestures.touchstart);
      carousel.addEventListener('touchmove', gestures.touchmove);
      carousel.addEventListener('touchend', gestures.touchend);
      carousel.addEventListener('wheel', gestures.wheel);
    } else {
      carousel.removeEventListener('touchstart', gestures.touchstart);
      carousel.removeEventListener('touchmove', gestures.touchmove);
      carousel.removeEventListener('touchend', gestures.touchend);
      carousel.removeEventListener('wheel', gestures.wheel);
    }
  }
  window.addEventListener('resize', handleResize);
  handleResize();
})();

// Make tabs in #features go live 🎉
(() => {
  function setUpListeners() {
    const tabsNodes = document.querySelectorAll('.tab'),
          tabsContentNodes = document.querySelectorAll('.tab-content'),
          tabsShowcaseScreenshots = document.querySelectorAll('#features .phone-ss:not([data-lazyload])');

    let currentSelected = 0;

    Array.prototype.forEach.call(tabsNodes, (tab, tabIndex) => {
      tab.addEventListener('click', () => {
        requestAnimationFrame(() => {
          tabsNodes[tabIndex].classList.add('active');
          tabsContentNodes[tabIndex].classList.add('active');
          tabsShowcaseScreenshots.length && tabsShowcaseScreenshots[tabIndex].classList.add('active');
          tabsNodes[currentSelected].classList.remove('active');
          tabsContentNodes[currentSelected].classList.remove('active');
          tabsShowcaseScreenshots.length && tabsShowcaseScreenshots[currentSelected].classList.remove('active');
          currentSelected = tabIndex;
        });
      });
    });

    document.querySelector('#features .showcase').classList.add('upgraded');
  }
  
  setUpListeners();
  window.addEventListener('fullimagesloaded', setUpListeners, { once: true });

  const promise = 'fonts' in document ?
    document.fonts.ready :
    new Promise(r => {
      if (document.readyState === 'complete')
        r();
      else
        window.addEventListener('load', r);
    });
  function setContainerSize() {
    const tabsContentContainer = document.querySelector('#tabs-content');
    // TODO: Find a better way to do that
    tabsContentContainer.removeAttribute('style');
    tabsContentContainer.classList.remove('upgraded');
    const { width, height } = tabsContentContainer.getBoundingClientRect();
    if ('attributeStyleMap' in tabsContentContainer && 'CSS' in window) {
      tabsContentContainer.attributeStyleMap.set('width', CSS.px(width));
      tabsContentContainer.attributeStyleMap.set('height', CSS.px(height));
    } else {
      tabsContentContainer.style.width = width + 'px';
      tabsContentContainer.style.height = height + 'px';
    }
    tabsContentContainer.classList.add('upgraded');
  }
  promise.then(() => {
    window.addEventListener('resize', setContainerSize);
    window.addEventListener('fullimagesloaded', setContainerSize);
    setContainerSize();
  });
})();

// Hide nav menu when item is chosen (phone)
(() => {
  const linksInNav = document.querySelectorAll('nav > a');
  
  function isPhone() {
    return window.matchMedia('(max-width: 700px)').matches;
  }

  Array.prototype.forEach.call(linksInNav, link => {
    link.addEventListener('click', () => {
      if (isPhone())
        document.querySelector('#nav-toggle').checked = false;
    });
  })
})();

// Fade scroll indicator in or out, depending on behaviour
(() => {
  let isProminent = true;
  const scrollDownIndicator = document.querySelector('#scroll-down-indicator');
  scrollDownIndicator.style.transition = 'opacity 200ms ease-in';
  let inactiveAtTopTimeout;
  window.addEventListener('scroll', () => {
    // When user scrolls down, fade out
    if (isProminent && (window.scrollY ? window.scrollY : window.pageYOffset) > 200) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        scrollDownIndicator.style.opacity = 0.3;
        isProminent = false;
      }));
    // And back in when he stays inactive at the top
    } else if (!isProminent && (window.scrollY ? window.scrollY : window.pageYOffset) === 0) {
      if (inactiveAtTopTimeout)
        return;
      else
        inactiveAtTopTimeout =
          setTimeout(() => requestAnimationFrame(() => {
            scrollDownIndicator.style.opacity = 1;
            isProminent = true;
          }), 5000);
    } else if (inactiveAtTopTimeout)
      clearTimeout(inactiveAtTopTimeout);
  }, { passive: true });
})();

// Upgrade download button on desktop
(() => {
  const upgradeDownloadBtn = () => {
    const downloadButton = document.querySelector('#download-button'),
          donwloadSection = document.querySelector('#download-section');
    
    donwloadSection.classList.add('upgraded', 'collapsed');
    downloadButton.removeAttribute('href');

    const handleOutsideClick = e => {
      if (e.target !== downloadButton) {
        donwloadSection.classList.add('collapsed');
        window.removeEventListener('click', handleOutsideClick);
      }
    }
    const handleOutsideClickPreventer = e => e.stopPropagation();

    downloadButton.addEventListener('click', () => {
      const collapsed = donwloadSection.classList.toggle('collapsed');
      if (!collapsed) {
        window.addEventListener('click', handleOutsideClick, { passive: true });
        donwloadSection.addEventListener('click', handleOutsideClickPreventer);
      } else {
        window.removeEventListener('click', handleOutsideClick);
        donwloadSection.removeEventListener('click', handleOutsideClickPreventer);
      }
    });
  };
  document.readyState === 'complete' ?
    upgradeDownloadBtn() :
    window.addEventListener('load', upgradeDownloadBtn, { once: true });
})();

// Animate nav menu on mobile
(() => {
  const navEl = document.querySelector('nav'),
        checkboxEl = document.querySelector('#nav-toggle');

  checkboxEl.addEventListener('change', () => {
    const isChecked = checkboxEl.checked;
    navEl.addEventListener('transitionend', () => {
      requestAnimationFrame(() => navEl.removeAttribute('style'));
    }, { once: true });
    navEl.classList.add('collapsed');
    'attributeStyleMap' in navEl ?
      navEl.attributeStyleMap.set('display', 'flex') :
      navEl.style.display = 'flex';
    if (isChecked)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        navEl.classList.remove('collapsed');
      }))
  });

  navEl.classList.add('upgraded');
})();