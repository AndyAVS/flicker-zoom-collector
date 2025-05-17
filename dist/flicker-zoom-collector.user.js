"use strict";
// ==UserScript==
// @name         Flickr Zoom Images Collector
// @namespace    http://tampermonkey.net/
// @version      0.5.9
// @description  Flickr Zoom Images Collector
// @author       andy fullframe
// @license      MIT
// @match        https://www.flickr.com/photos/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
(function () {
    "use strict";
    const LIST_ID = "07fcd6c0-18f1-4883-ac55-1c59e51a4ee9";
    const buildListItem = (link) => {
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
        const imgs = imgContainer.querySelectorAll("img[src]");
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
        const targetContainer = document.querySelector("div.comment-count-container");
        if (!targetContainer) {
            console.warn("comment-count-container not found");
            return;
        }
        const links = getImagesSrcList();
        if (!links.length) {
            console.warn("empty imgs list");
            return;
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
        targetContainer.appendChild(list);
        console.log(`${links.length} links added to page`);
    };
    document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "z" && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            addLinksToDom();
        }
    });
})();
