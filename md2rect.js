/*!
 * markdown text parse to rectangle shape diagram
 * JerryPan - v1.0.0 (2021-01-08)
 * https://github.com/panii/md2rect | Released under MIT license 
 */
var md2rect = {
    cmds: {
        cmd: "",
        cmdMap: {
            "## 标题": "title",
            "## 背景颜色": "bg",
            "## 文字说明": "bgTip"
        }
    },
    settings: {
        title: "",
        bg: {},
        bgTip: {}
    },
    boxes: [],
    newBox: function(boxTitleTxt, newLine) {
        var box = document.createElement("div");
        box.className = "box";
        var boxTitle = document.createElement("div");
        boxTitle.className = "box-title";
        box.appendChild(boxTitle);
        var areaWrap = document.createElement("div");
        areaWrap.className = "area-wrap";
        box.appendChild(areaWrap);
        boxTitle.innerHTML = boxTitleTxt;
        if (newLine) {
            var newLine = document.createElement("div");
            newLine.style.clear = "both";
            document.body.appendChild(newLine);
        }
        document.body.appendChild(box);
        
        return areaWrap;
    },
    newItems: function(areaWrap, areaTitle, items) {
        var html = [];
        html.push('<div class="area-title">' + areaTitle + '</div>');
        html.push('<div class="area">');
        items.forEach(function(_item) {
            html.push('<div class="item" style="background-color:#' + md2rect.settings.bg[_item[0]] + '">' + _item[1] + '</div>');
        })
        html.push('</div>');
        areaWrap.innerHTML += html.join("");
    },
    render: function() {
        var title = document.createElement("div");
        title.style.textAlign = "center";
        title.style.margin = "10px";
        title.innerHTML = `<h2>${md2rect.settings.title}</h2>`;
        document.body.appendChild(title);
        document.title = md2rect.settings.title;

        md2rect.boxes.forEach(function(box) {
            var areaWrap = md2rect.newBox(box.boxTitle, box.newLine);
            box.areas.forEach(function(area) {
                md2rect.newItems(areaWrap, area.areaTitle, area.items);
            })
        });
        var maxBoxWidth = 0;
        var maxBoxHeight = 0;
        document.querySelectorAll(".box").forEach(function(ele){ maxBoxWidth = Math.max(maxBoxWidth, ele.clientWidth); maxBoxHeight = Math.max(maxBoxHeight, ele.clientHeight); });
        document.querySelectorAll(".box").forEach(function(ele){ ele.style.width = maxBoxWidth + "px"; /*ele.style.height = maxBoxHeight + "px";*/ });
        
        if (Object.keys(md2rect.settings.bgTip).length > 0) {
            var html = ['<div style="clear:both;"></div><div style="float:left">'];
            Object.keys(md2rect.settings.bgTip).forEach(function(tipKey) {
                html.push('<div class="item-small" style="background-color:#' + md2rect.settings.bg[tipKey] + '">' + md2rect.settings.bgTip[tipKey] + '</div>');
            });
            html.push('</div><div style="clear:both;"></div>');
            document.body.innerHTML += html.join("");
        }
    }
}

fetch("README.md").then(function(response) {
    return response.text()
}).then(function(data) {
    let newLine = 0;
    data.split("\n").forEach(function(lineContent) {
        lineContent = lineContent.trim();
        if (lineContent == "---") {
            md2rect.cmds.cmd = "set-content";
            newLine++;
            return;
        }
        if (md2rect.cmds.cmd == "set-content") {
            if (lineContent.charAt(0) == "#" && lineContent.charAt(1) == " ") {
                md2rect.boxes.push({boxTitle: lineContent.split("# ")[1], areas: [], newLine: (newLine == 2)});
                newLine = 0;
                return;
            }
            if (lineContent.charAt(0) == "#" && lineContent.charAt(1) == "#") {
                md2rect.boxes[md2rect.boxes.length - 1].areas.push({areaTitle: lineContent.split("## ")[1], items: []});
                return;
            }
            if (lineContent.length > 0) {
                var content = lineContent.split("> ");
                md2rect.boxes[md2rect.boxes.length - 1].areas[md2rect.boxes[md2rect.boxes.length - 1].areas.length - 1].items.push(["> ".repeat(content.splice(0, content.length - 1).length), content[0]]);
                return;
            }
        } else {
            if (lineContent.charAt(0) == "#") {
                md2rect.cmds.cmd = md2rect.cmds.cmdMap[lineContent];
                return;
            }
            
            if (lineContent.length > 0) {
                var content = lineContent.split("> ");
                if (content.length > 1) {
                    md2rect.settings[md2rect.cmds.cmd]["> ".repeat(content.splice(0, content.length - 1).length)] = content[0];
                } else {
                    md2rect.settings[md2rect.cmds.cmd] = content[0];
                }
                return;
            }
        }
    })

    md2rect.render();
})