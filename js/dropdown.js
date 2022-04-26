"use strict";
(function () {
    
    function getObjectForCoordinates (event) {
        if (window.isMobile==="false") return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
        else return event;
    }
    
    let dropdowns=[];
    function Dropdowns () {
        let dropdowns = new Map();
        this.menus=[];
        function DropdownMenu (name, list) {
            this.name=name;

            let menu='<ul class="dropdown-menu '+name+'">';
            for (let [option, text] of list) {
                menu+='<li><a class="dropdown-item unselectable '+option+'">'+text+'</a></li>';
            }
            menu+='</ul>';
            this.object=$(menu);
            $("body").append(this.object);

            this.clickInfo=undefined;
            for (let [option, text, event] of list) {
                this.object.find("."+option).on("click",function () {
                    event.call(this,this.clickInfo);
                }.bind(this));
            }
        }

        this.addNewDropdown = function (name, list) {
            if (dropdowns.has(name)===true) return ;
            let dropdown = new DropdownMenu(name,list);
            dropdowns.set(name,dropdown);
            this.menus[name]=dropdown.object;
        }
        this.closeDropdowns = function () {
            for (let [name, dropdown] of dropdowns) {
                dropdown.object.removeClass("show");
            }
        }
        this.showDropdown = function (name, event, clickInfo) {
            this.closeDropdowns();
            dropdowns.get(name).clickInfo=clickInfo;
            let dropdown=dropdowns.get(name).object;
            let bodyOffsets=document.body.getBoundingClientRect();
            let obj=getObjectForCoordinates(event);
            let diffX=0,diffY=0;
            if (obj.clientY+dropdown.outerHeight()>$(window).height()) diffY=dropdown.outerHeight();
            if (obj.clientX+dropdown.outerWidth()>$(window).width()) {
                diffX=obj.clientX+dropdown.outerWidth()-$(window).width();
            }
            dropdown.css({"top": obj.pageY-diffY, "left": obj.pageX-diffX});
            dropdown.addClass("show");
            event.stopPropagation();
            event.preventDefault();
            $(window).one("click",function () {
                dropdown.removeClass("show");
            });
        }
    }
    

    window.Dropdowns = Dropdowns;
    window.dropdowns = dropdowns;
})();