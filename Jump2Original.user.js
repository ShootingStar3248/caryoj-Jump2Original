// ==UserScript==
// @name         Jump2Original
// @author       DeepSeek-v4-flash & ShootingStar
// @description  在 caryoj 题目页面添加跳转按钮，支持跳转到原题与洛谷搜索。
// @namespace    http://tampermonkey.net/
// @version      6.9
// @match        https://www.caryoj.cn/p/*
// @match        https://www.luogu.com.cn/problem/*
// @grant        GM_xmlhttpRequest
// @lisence      MIT
// ==/UserScript==

(function() {
    'use strict';

    let isButtonAdded = false;
    let isSearching = false;

    // ============ 工具函数 ============

    function isProblemPage() {
        const path = window.location.pathname;
        return /^\/p\/[^\/]+$/.test(path);
    }

    function hasErrorElement() {
        return document.querySelector('.error__twd2') !== null;
    }

    function checkIfFromSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('from_hydro_search') === '1';
    }

    function getSearchListUrlFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('search_list_url');
    }

    function parseProblemUrl() {
        const currentUrl = window.location.href;
        const match = currentUrl.match(/\/p\/([^\/?]+)/);
        if (!match) return null;

        const fullId = match[1];
        const prefixMatch = fullId.match(/^([a-zA-Z]+)-(.+)/);
        if (prefixMatch) {
            return {
                prefix: prefixMatch[1].toLowerCase(),
                id: prefixMatch[2],
                fullId: fullId
            };
        }
        return {
            prefix: '',
            id: fullId,
            fullId: fullId
        };
    }

    // ============ 悬浮球功能 ============
    function addFloatingBall() {
        if (!window.location.href.match(/https:\/\/www\.luogu\.com\.cn\/problem\/.+/)) {
            return;
        }

        if (!checkIfFromSearch()) {
            return;
        }

        if (document.getElementById('hydro-search-float-ball')) {
            return;
        }

        const searchListUrl = getSearchListUrlFromUrl();
        if (searchListUrl) {
            console.log('从URL获取到搜索列表链接:', searchListUrl);
        } else {
            console.warn('URL中未找到搜索列表链接');
        }

        const ball = document.createElement('div');
        ball.id = 'hydro-search-float-ball';
        ball.textContent = '?';
        ball.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2d8cf0, #1a6bb0);
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 99999;
            box-shadow: 0 4px 16px rgba(45, 140, 240, 0.4);
            transition: transform 0.3s, box-shadow 0.3s, opacity 1s ease;
            user-select: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            opacity: 1;
        `;

        ball.onmouseover = function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 24px rgba(45, 140, 240, 0.6)';
        };
        ball.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(45, 140, 240, 0.4)';
        };

        ball.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        document.body.appendChild(ball);

        let fadeTimeout = setTimeout(() => {
            ball.style.opacity = '0';
            setTimeout(() => {
                if (ball.parentNode) {
                    ball.style.display = 'none';
                }
            }, 1000);
        }, 10000);

        ball.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.display = 'flex';
            clearTimeout(fadeTimeout);
        });

        ball.addEventListener('mouseleave', function() {
            fadeTimeout = setTimeout(() => {
                ball.style.opacity = '0';
                setTimeout(() => {
                    if (ball.parentNode) {
                        ball.style.display = 'none';
                    }
                }, 1000);
            }, 10000);
        });

        const menu = document.createElement('div');
        menu.id = 'hydro-search-menu';
        menu.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 30px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            padding: 8px 0;
            min-width: 200px;
            z-index: 99999;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
        `;

        const menuItems = [
            { text: '关闭此标签页', action: closeTab },
            { text: '显示搜索列表', action: showSearchList },
            { text: '关闭并显示搜索列表', action: closeAndShowList }
        ];

        menuItems.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.text;
            div.style.cssText = `
                padding: 10px 20px;
                cursor: pointer;
                font-size: 14px;
                color: #333;
                transition: background 0.2s;
                border-bottom: 1px solid #f0f0f0;
            `;
            if (item === menuItems[menuItems.length - 1]) {
                div.style.borderBottom = 'none';
            }
            div.onmouseover = function() {
                this.style.background = '#f5f7fa';
            };
            div.onmouseout = function() {
                this.style.background = 'transparent';
            };
            div.addEventListener('click', function(e) {
                e.stopPropagation();
                hideMenu();
                item.action();
            });
            menu.appendChild(div);
        });

        document.body.appendChild(menu);

        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && e.target !== ball) {
                hideMenu();
            }
        });

        function toggleMenu() {
            if (menu.style.display === 'block') {
                hideMenu();
            } else {
                showMenu();
            }
        }

        function showMenu() {
            menu.style.display = 'block';
            ball.style.transform = 'scale(1.1)';
        }

        function hideMenu() {
            menu.style.display = 'none';
            ball.style.transform = 'scale(1)';
        }

        function closeTab() {
            window.close();
        }

        function showSearchList() {
            const url = getSearchListUrlFromUrl();
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('未找到搜索列表，请重新搜索');
            }
        }

        function closeAndShowList() {
            const url = getSearchListUrlFromUrl();
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('未找到搜索列表，请重新搜索');
            }
            window.close();
        }
    }

    // ============ 主页面功能 ============

    // 支持的来源列表（显示"查看原题"）
    const ORIGINAL_SOURCES = ['luogu', 'codeforces', 'atcoder', 'spoj', 'bzoj', 'loj'];

    // 构建跳转到原题的URL
    function buildOriginalUrl(prefix, id) {
        if (prefix === 'codeforces') {
            let cleanId = id.replace(/^P/i, '');
            const numMatch = cleanId.match(/^(\d+)/);
            if (!numMatch) return `https://codeforces.com/search?query=${id}`;
            const num = numMatch[1];
            const letterMatch = cleanId.match(/^\d+([A-Z]+)/);
            const letter = letterMatch ? letterMatch[1] : '';
            if (letter) {
                return `https://codeforces.com/problemset/problem/${num}/${letter}`;
            } else {
                return `https://codeforces.com/problemset/problem/${num}`;
            }
        }

        if (prefix === 'atcoder') {
            const atMatch = id.match(/^([A-Z]+)(\d+)([A-Z]?)/);
            if (atMatch) {
                const contestType = atMatch[1];
                const contestNum = atMatch[2];
                const taskId = atMatch[3] || 'A';
                const contestName = `${contestType.toLowerCase()}${contestNum}`;
                const taskName = `${contestType.toLowerCase()}${contestNum}_${taskId.toLowerCase()}`;
                return `https://atcoder.jp/contests/${contestName}/tasks/${taskName}`;
            }
            return `https://atcoder.jp/search?q=${id}`;
        }

        if (prefix === 'spoj') {
            return `https://www.spoj.com/problems/${id}/`;
        }

        if (prefix === 'bzoj') {
            const numericId = id.replace(/\D/g, '');
            if (numericId) {
                return `https://darkbzoj.cc/problem/${numericId}`;
            }
            return `https://darkbzoj.cc/problem/${id}`;
        }

        // LOJ (LibreOJ)
        if (prefix === 'loj') {
            // LOJ 的 URL 格式：https://loj.ac/p/题目ID
            // 注意：id 可能包含 P 前缀，如 P10043，需要去掉
            const cleanId = id.replace(/^P/i, '');
            return `https://loj.ac/p/${cleanId}`;
        }

        if (prefix === 'luogu') {
            return `https://www.luogu.com.cn/problem/${id}`;
        }

        return null;
    }

    // 从页面提取完整标题（用于搜索）
    function extractFullTitle() {
        const h1 = document.querySelector('h1.section__title');
        if (h1) {
            const clone = h1.cloneNode(true);
            const children = clone.children;
            for (let i = children.length - 1; i >= 0; i--) {
                children[i].remove();
            }
            let titleText = clone.textContent.trim();
            if (titleText) {
                return titleText;
            }
        }

        const selectors = ['h1', '.problem-title', '.title', '.l-card .main h1', '.markdown-body h1'];
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                let text = el.textContent.trim();
                if (text) {
                    return text;
                }
            }
        }

        return '';
    }

    // 在洛谷搜索
    function searchOnLuogu(keyword, autoJump = true) {
        return new Promise((resolve, reject) => {
            const searchUrl = `https://www.luogu.com.cn/problem/list?type=all&keyword=${encodeURIComponent(keyword)}`;
            console.log(`洛谷搜索: ${searchUrl}`);

            GM_xmlhttpRequest({
                method: 'GET',
                url: searchUrl,
                onload: function(response) {
                    const html = response.responseText;

                    try {
                        if (response.status !== 200) {
                            reject(new Error(`HTTP ${response.status}`));
                            return;
                        }

                        if (html.includes('访问过于频繁') || html.includes('验证') || html.includes('captcha')) {
                            reject(new Error('洛谷访问限制，请稍后'));
                            return;
                        }

                        if (!autoJump) {
                            resolve(searchUrl);
                            return;
                        }

                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');

                        const selectors = [
                            '.row .title a',
                            '.problem-list .title a',
                            'a[href*="/problem/"]'
                        ];

                        let firstUrl = null;
                        for (const selector of selectors) {
                            const elements = doc.querySelectorAll(selector);
                            for (const el of elements) {
                                const href = el.getAttribute('href');
                                if (href && href.startsWith('/problem/')) {
                                    const problemId = href.replace('/problem/', '');
                                    firstUrl = `https://www.luogu.com.cn/problem/${problemId}`;
                                    break;
                                }
                            }
                            if (firstUrl) break;
                        }

                        const countMatch = html.match(/共计\s*(\d+)\s*条结果/);
                        const count = countMatch ? parseInt(countMatch[1]) : 0;

                        if (firstUrl) {
                            console.log(`找到第一个结果: ${firstUrl}`);
                            resolve(firstUrl);
                        } else if (count > 0) {
                            reject(new Error(`找到${count}条结果，但无法解析链接`));
                        } else {
                            reject(new Error('未找到任何结果'));
                        }

                    } catch (e) {
                        console.error('解析搜索页面失败:', e);
                        reject(new Error('解析失败'));
                    }
                },
                onerror: function(error) {
                    console.error('请求失败:', error);
                    reject(new Error('网络请求失败'));
                },
                ontimeout: function() {
                    reject(new Error('请求超时'));
                },
                timeout: 10000
            });
        });
    }

    // 弹出搜索对话框
    function showSearchDialog(defaultKeyword) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: #fff;
                border-radius: 8px;
                padding: 24px 28px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;

            dialog.innerHTML = `
                <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #333;">在洛谷搜索</h3>
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">请输入搜索关键词：</p>
                <input id="search-keyword-input" type="text" value="${defaultKeyword.replace(/"/g, '&quot;')}" style="
                    width: 100%;
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                    margin-bottom: 12px;
                ">
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;">
                    <button id="search-list-btn" style="
                        padding: 6px 16px;
                        font-size: 14px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f5f5f5;
                        color: #333;
                        cursor: pointer;
                    ">显示列表</button>
                    <button id="search-cancel-btn" style="
                        padding: 6px 16px;
                        font-size: 14px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #f5f5f5;
                        color: #333;
                        cursor: pointer;
                    ">取消</button>
                    <button id="search-confirm-btn" style="
                        padding: 6px 16px;
                        font-size: 14px;
                        border: none;
                        border-radius: 4px;
                        background: #5cb85c;
                        color: #fff;
                        cursor: pointer;
                    ">搜索并跳转</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            const input = dialog.querySelector('#search-keyword-input');
            setTimeout(() => input.focus(), 100);
            input.select();

            const confirmBtn = dialog.querySelector('#search-confirm-btn');
            const listBtn = dialog.querySelector('#search-list-btn');
            const cancelBtn = dialog.querySelector('#search-cancel-btn');

            function getKeyword() {
                const keyword = input.value.trim();
                if (!keyword) {
                    input.style.borderColor = '#d9534f';
                    input.style.boxShadow = '0 0 0 3px rgba(217,83,79,0.2)';
                    return null;
                }
                return keyword;
            }

            confirmBtn.addEventListener('click', function() {
                const keyword = getKeyword();
                if (keyword) {
                    overlay.remove();
                    resolve({ action: 'jump', keyword });
                }
            });

            listBtn.addEventListener('click', function() {
                const keyword = getKeyword();
                if (keyword) {
                    overlay.remove();
                    resolve({ action: 'list', keyword });
                }
            });

            cancelBtn.addEventListener('click', function() {
                overlay.remove();
                resolve(null);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
                if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(null);
                }
            });
        });
    }

    // 创建按钮容器
    function createButtonContainer() {
        let container = document.getElementById('hydro-oj-buttons-container');
        if (container) {
            return container;
        }

        const titleElement = document.querySelector('h1.section__title, h1, .problem-title, .title');

        if (titleElement) {
            container = document.createElement('span');
            container.id = 'hydro-oj-buttons-container';
            container.style.cssText = 'margin-left: 15px; display: inline-block;';

            if (titleElement.nextSibling) {
                titleElement.parentNode.insertBefore(container, titleElement.nextSibling);
            } else {
                titleElement.parentNode.appendChild(container);
            }
            return container;
        }

        container = document.createElement('div');
        container.id = 'hydro-oj-buttons-container';
        container.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999;';
        document.body.appendChild(container);
        return container;
    }

    // 创建普通按钮
    function createButton(text, url, color, hoverColor = null) {
        const button = document.createElement('a');
        button.textContent = text;
        button.href = url;
        button.target = '_blank';
        button.style.cssText = `
            display: inline-block;
            padding: 5px 12px;
            margin-right: 6px;
            background-color: ${color};
            color: #fff;
            border-radius: 4px;
            text-decoration: none;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: opacity 0.2s;
        `;
        button.onmouseover = function() {
            if (hoverColor) {
                this.style.backgroundColor = hoverColor;
            } else {
                this.style.opacity = '0.85';
            }
        };
        button.onmouseout = function() {
            if (hoverColor) {
                this.style.backgroundColor = color;
            } else {
                this.style.opacity = '1';
            }
        };
        return button;
    }

    // 创建搜索按钮
    function createSearchButton(text, defaultKeyword, color) {
        const button = document.createElement('a');
        button.textContent = text;
        button.style.cssText = `
            display: inline-block;
            padding: 5px 12px;
            margin-right: 6px;
            background-color: ${color};
            color: #fff;
            border-radius: 4px;
            text-decoration: none;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: opacity 0.2s;
        `;

        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (isSearching) return;

            const result = await showSearchDialog(defaultKeyword);
            if (result === null) return;

            const { action, keyword } = result;
            isSearching = true;

            const originalText = this.textContent;
            this.textContent = action === 'list' ? '获取列表中...' : '搜索中...';
            this.style.opacity = '0.7';
            this.style.cursor = 'wait';

            try {
                const autoJump = (action === 'jump');
                const url = await searchOnLuogu(keyword, autoJump);

                const searchListUrl = `https://www.luogu.com.cn/problem/list?type=all&keyword=${encodeURIComponent(keyword)}`;

                if (action === 'list') {
                    window.open(searchListUrl, '_blank');
                } else {
                    let finalUrl = url;
                    const separator = url.includes('?') ? '&' : '?';
                    finalUrl = `${url}${separator}from_hydro_search=1&search_list_url=${encodeURIComponent(searchListUrl)}`;
                    window.open(finalUrl, '_blank');
                }
            } catch (error) {
                this.textContent = error.message || '搜索失败';
                this.style.backgroundColor = '#d9534f';
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = color;
                    this.style.opacity = '1';
                    this.style.cursor = 'pointer';
                    isSearching = false;
                }, 3000);
                return;
            }

            this.textContent = originalText;
            this.style.opacity = '1';
            this.style.cursor = 'pointer';
            isSearching = false;
        });

        button.onmouseover = function() {
            if (!isSearching) this.style.opacity = '0.85';
        };
        button.onmouseout = function() {
            if (!isSearching) this.style.opacity = '1';
        };

        return button;
    }

    // 添加按钮
    function addButtons() {
        if (isButtonAdded) return;

        if (!isProblemPage()) {
            console.log('不是 /p/ 一层路径页面，跳过');
            return;
        }

        if (hasErrorElement()) {
            console.log('页面包含错误元素，不添加按钮');
            return;
        }

        const parsed = parseProblemUrl();
        if (!parsed) {
            console.log('无法解析页面内容');
            return;
        }

        const { prefix, id, fullId } = parsed;

        const container = createButtonContainer();
        if (!container) {
            console.log('无法创建按钮容器');
            return;
        }

        container.innerHTML = '';

        const showOriginal = prefix && ORIGINAL_SOURCES.includes(prefix);
        const showSearch = prefix !== 'luogu';

        // 1. 查看原题
        if (showOriginal) {
            const originalUrl = buildOriginalUrl(prefix, id);
            if (originalUrl) {
                const originalBtn = createButton('查看原题', originalUrl, '#2d8cf0');
                container.appendChild(originalBtn);
            }
        }

        // 2. 在洛谷搜索
        if (showSearch) {
            const fullTitle = extractFullTitle();
            const defaultKeyword = fullTitle || fullId || id;
            console.log(`搜索默认关键词: "${defaultKeyword}"`);

            const searchBtn = createSearchButton('在洛谷搜索', defaultKeyword, '#5cb85c');
            container.appendChild(searchBtn);
        }

        // 3. 查看题解（仅当是洛谷题目时显示）
        if (prefix === 'luogu') {
            const solutionUrl = `https://www.luogu.com.cn/problem/solution/${id}`;
            const solutionBtn = createButton('查看题解', solutionUrl, '#f0ad4e', '#ec971f');
            container.appendChild(solutionBtn);
        }

        isButtonAdded = true;
        console.log('按钮添加成功');
    }

    // 检查并清理按钮
    function checkAndCleanup() {
        if (hasErrorElement() || !isProblemPage()) {
            const container = document.getElementById('hydro-oj-buttons-container');
            if (container) {
                container.remove();
                isButtonAdded = false;
                console.log('检测到错误页面或非一层路径页面，已移除按钮');
            }
        }
    }

    // ============ 初始化 ============

    if (window.location.href.match(/https:\/\/www\.luogu\.com\.cn\/problem\/.+/)) {
        if (document.readyState === 'complete') {
            setTimeout(addFloatingBall, 500);
        } else {
            window.addEventListener('load', function() {
                setTimeout(addFloatingBall, 500);
            });
        }
    }

    if (window.location.href.match(/https:\/\/www\.caryoj\.cn\/p\/.+/)) {
        if (!isProblemPage()) {
            console.log('当前页面不是 /p/ 一层路径页面，脚本不执行');
        } else {
            const observer = new MutationObserver(function(mutations) {
                checkAndCleanup();

                if (!isButtonAdded && !hasErrorElement() && isProblemPage()) {
                    const titleExists = document.querySelector('h1.section__title, h1, .problem-title, .title');
                    if (titleExists) {
                        setTimeout(addButtons, 200);
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false
            });

            if (document.readyState === 'complete') {
                setTimeout(addButtons, 300);
            } else if (document.readyState === 'interactive') {
                setTimeout(addButtons, 500);
            } else {
                window.addEventListener('load', function() {
                    setTimeout(addButtons, 300);
                });
            }

            setTimeout(function() {
                if (!isButtonAdded && !hasErrorElement() && isProblemPage()) {
                    addButtons();
                }
                checkAndCleanup();
            }, 5000);
        }
    }

    console.log('HydroOJ 跳转插件已加载');

})();
