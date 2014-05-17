(function ($) {
    'use strict';
    $.fn.dataTable = function (o) {
        var target = this,
            activeClass = 'active',
            triggerName = 'data-change',
            asc = 'sort-asc',
            roleAttr = 'data-role=',
            currPage = 0,
            temp = null,
            data,
            keys,
            labels,
            itemsPerPage,
            maxPage,
            rowFormatter,
            thead,
            trs,
            currPageDisp,
            maxPageDisp,
            orderBy;

        function page() {
            var start = currPage * itemsPerPage,
                end = start + itemsPerPage;
            trs.each(function () {
                $(this).removeClass('even').addClass('disabled');
            });
            $.each(data.slice(start, end), function (idx, obj) {
                var tr = $(trs[obj.id]);
                if (idx % 2 === 0) {
                    tr.addClass('even');
                }
                tr.removeClass('disabled');
            });
            currPageDisp.text(currPage + 1);
        }

        function initHTML() {
            target.append("<div><button type='button' " + roleAttr + "'sort-asc' class='order-btns active'>Ascending</button><button type='button' " + roleAttr + "'sort-desc' class='order-btns'>Descending</button></div><span class='select-label'>Items Per Page: </span><select " + roleAttr + "'num-items'><option>5</option><option selected>10</option><option>20</option><option>50</option></select><input type='text' " + roleAttr + "'search' placeholder='Search' class='data-table-search' /><table class='data-table'><thead></thead><tbody></tbody></table><div class='data-table-nav'><button type='button' " + roleAttr + "'page-prev'><</button><span " + roleAttr + "'curr-page'>1</span> of <span " + roleAttr + "'max-page'>10</span><button type='button' " + roleAttr + "'page-next'>></button></div>");
            var table = target.children('table');
            thead = table.children('thead');
            orderBy = asc;
            currPageDisp = $('span[' + roleAttr + '"curr-page"]');
            maxPageDisp = $('span[' + roleAttr + '"max-page"]');
            
            $('button[data-role]').click(function () {
                var currEle = $(this), role = currEle.data('role');
                switch (role) {
                case asc:
                case "sort-desc":
                    if (!currEle.hasClass(activeClass)) {
                        currEle.addClass(activeClass)
                            .siblings('button')
                            .removeClass(activeClass);
                        orderBy = role;
                    }
                    break;
                case "page-prev":
                    if (currPage > 0) {
                        --currPage;
                        page();
                    }
                    break;
                case "page-next":
                    if (currPage < maxPage - 1) {
                        ++currPage;
                        page();
                    }
                    break;
                }
            });

            thead.on('click', 'tr th', function () {
                var k = $(this).data("key"), sortFn;
                if (!isNaN(+data[0][k])) {
                    sortFn = orderBy === asc ? function (a, b) {
                        return a[k] - b[k];
                    } : function (a, b) {
                        return b[k] - a[k];
                    };
                } else {
                    sortFn = orderBy === asc ? function (a, b) {
                        return a[k].localeCompare(b[k]);
                    } : function (a, b) {
                        return b[k].localeCompare(a[k]);
                    };
                }
                data = data.sort(sortFn);
                page();
            });

            $('input[' + roleAttr + '"search"]').keyup(function () {
                var q = $(this).val();
                if (q) {
                    if (!temp) {
                        temp = data;
                    }
                    var searchResults = temp.filter(function (a) {
                        for (var k in a) {
                            if (a[k].toString().indexOf(q) !== -1) {
                                return true;
                            }
                        }
                    });
                    data = searchResults;
                } else {
                    data = temp;
                    temp = null;
                }
                currPage = 0;
                maxPage = Math.ceil(data.length / itemsPerPage);
                maxPageDisp.text(maxPage);
                page();
            });

            $('select[' + roleAttr + '"num-items"]').on('change', function () {
                var ddl = $(this)[0];
                itemsPerPage = parseInt(ddl.options[ddl.selectedIndex].text);
                page();
            })
        }

        function initData() {
            maxPageDisp.text(maxPage);
            var hdr = "<tr>", tableHTML = "", tbody = target.children('table').find('tbody');
            $.each(keys, function (idx, key) {
                hdr += "<th data-key='" + key + "'>" + labels[idx] + "</th>";
            });
            hdr += "</tr>";
            thead.empty()
                .append(hdr)
                .find('tr th')
                .width((100 / keys.length) + "%");
            $.each(data, function (idx, obj) {
                obj.id = idx;
                if (rowFormatter && !obj.f) {
                    rowFormatter(obj);
                    obj.f = true;
                }
                tableHTML += "<tr class='disabled'><td>" + keys.map(function (val) { return obj[val]; }).join("</td><td>") + "</td></tr>";
            });
            tbody.html(tableHTML);
            trs = $(tbody.children('tr'));
            page();
        }

        target.bind(triggerName, function (evt, o) {
            data = o.data;
            keys = Object.keys(o.data[0]);
            labels = o.labels || keys;
            itemsPerPage = o.itemsPerPage || 10;
            maxPage = Math.ceil(data.length / itemsPerPage);
            rowFormatter = o.rowFormatter || null;
            initData();
            if ($.fn.responsivize) { $.fn.responsivize(keys.length); }
        });

        initHTML();
        target.trigger(triggerName, o);
        
    }
})(jQuery);