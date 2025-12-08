// ==UserScript==
// @name         Flickr Zoom Images Collector
// @namespace    http://tampermonkey.net/
// @version      0.8.6
// @description  Flickr Zoom Images Collector
// @author       andy fullframe
// @license      MIT
// @match        https://www.flickr.com/photos/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const LIST_ID = "07fcd6c0-18f1-4883-ac55-1c59e51a4ee9";

    const buildListItem = (link: string) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link;
        a.textContent = `${link.split("/").pop()}`;
        a.target = "_blank";
        a.style.wordBreak = "break-word";
        li.appendChild(a);
        return li;
    };

    const getImagesSrcList = () => {

        const imgContainer = document.querySelector("div.zoom-photo-container");
        if (!imgContainer) {
            console.warn("zoom-photo-container not found");
            return [];
        }

        const imgs = imgContainer.querySelectorAll(
            "img[src]"
        ) as NodeListOf<HTMLImageElement>;
        if (!imgs.length) {
            console.warn("images not found");
            return [];
        }

        const imgSrcList = Array.from(imgs).map((img) => img.src);
        const links = Array.from(new Set(imgSrcList));
        console.log(`found [${links.length}] images`);

        return links;
    };

    const addLinksToDom = () => {
        const targetContainer = document.querySelector(
            "div.comment-count-container"
        );

        if (!targetContainer) {
            console.warn("comment-count-container not found");
            return;
        }

        const links = getImagesSrcList();
        if (!links.length) {
            console.warn("empty imgs list");
        }

        const oldList = document.getElementById(LIST_ID);
        oldList?.remove();

        const list = document.createElement("ul");
        list.id = LIST_ID;
        list.style.marginTop = "10px";
        list.style.listStyleType = "circle";

        links.forEach((link) => {
            list.appendChild(buildListItem(link));
        });

        const newExifLink = createNewExifLink();
        if (newExifLink) {
            const li = document.createElement("li");
            li.appendChild(newExifLink);
            list.appendChild(li);
        }

        if (list.childNodes?.length) {
            targetContainer.appendChild(list);
        }

        console.log(`${list.childNodes?.length} links added to page`);
    };

    const createNewExifLink = () => {
        const settingsLink = document.querySelector("a.show-settings") as HTMLElement;

        if (!settingsLink) {
            console.warn("'a.show-settings' not found");
            return null;
        }

        const newLink = document.createElement("a");
        newLink.href = "#";
        newLink.textContent = "Show camera settings (EXIF)";

        newLink.addEventListener("click", (e) => {
            e.preventDefault();
            settingsLink.click();
        });

        return newLink;
    }

    const copyPaginationToTop = () => {
        /* photostream view */
        const paginations = document.querySelectorAll("div.view.pagination-view");
        let container = document.querySelector("div.photo-list-header-container");
        
        /* album view */
        if(!container){
            container = document.querySelector("div.view.photo-list-view");
        }

        if (paginations.length === 1 && container) {
            const clonedDiv = paginations[0].cloneNode(true);
            container.parentNode?.insertBefore(clonedDiv, container);
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.code === "KeyZ" && !e.ctrlKey && !e.metaKey && !e.altKey) {
            addLinksToDom();
        }
    });

    new MutationObserver(() => {
        setTimeout(copyPaginationToTop, 1500);
    }).observe(document, { subtree: true, childList: true });

})();
