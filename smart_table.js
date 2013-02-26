(function($) {
    $.fn.smart_table = function(method) {
        var methods = {
            init : function( options ) {
                return this.each(function() {
                    var
                        opts = $.extend({}, $.fn.smart_table.defaults, options),
                        $table = $("<table class='table'/>"),
                        $rows = getRows(opts.tableDataCSV, opts.numberOfColumns),
                        $self = $(this),
                        $titleAndSearch = '<table><tr><td>'+opts.tableTitle+'</td><td>&nbsp;&nbsp;&nbsp;</td><td>Search</td><td><input type="text" id="smart-table-search-input" size="26"/></td></tr></table>';

                    /*----------------------------------------------------
                     DOM Building
                     ---------------------------------------------------- */
                    $self.append($titleAndSearch);
                    $("#smart-table-search-input").keyup(function(){
                        resetFilters();
                        resetSearch();
                    });

                    $table.append($rows);
                    $self.append($table);

                    /*----------------------------------------------------
                     Private Functions
                     ---------------------------------------------------- */

                    function getRows(tableData, numberOfColumns) {
                        var dataArray = tableData.split(",");
                        var rows = [];
                        var $headerRow = $("<tr/>");

                        // create header row
                        for(var j = 0; j < numberOfColumns; j++) {
                            var $headerCell = $("<th>"+dataArray[j]+"</th>");
                            $headerCell.css({cursor:"pointer"});
                            $headerCell.data("colIdx", j);
                            // sorting events
                            $headerCell.click(function() {
                                if(!$(this).data("sort") || $(this).data("sort") === "desc") {
                                    $(this).data("sort","asc");
                                    methods["sort"].apply($self,[$(this).data("colIdx")]);
                                } else {
                                    $(this).data("sort","desc");
                                    methods["sort"].apply($self,[$(this).data("colIdx"), true] );
                                }
                            });
                            $headerRow.append($headerCell);
                        }
                        rows.push($headerRow);

                        // filters row
                        var $filtersRow = $("<tr/>");
                        rows.push($filtersRow);

                        // each array element is a set of unique values for column
                        var filtersSet = [];
                        filtersSet.add = function(i,val) {
                            if(!this[i]) {
                                this[i] = [];
                            }
                            if($.inArray(val, this[i]) === -1) {
                                this[i].push(val);
                            }
                        };

                        // populate table
                        while(j < dataArray.length) {
                            var $row = $("<tr>");
                            for(var i = 0; i < numberOfColumns; i++) {
                                filtersSet.add(i, dataArray[j]);
                                $row.append("<td>"+dataArray[j]+"</td>");
                                j++;
                            }
                            rows.push($row);
                        }

                        // create filters dropdown
                        for(var k = 0; k < numberOfColumns; k++) {
                            var $filterCell = $("<td/>");
                            var $select = $("<select><option></option></select>");

                            $select.data("colIdx", k);

                            $filterCell.append($select);
                            filtersSet[k].sort();
                            for(var l = 0; l < filtersSet[k].length; l++) {
                                if(filtersSet[k][l]) {
                                    $select.append("<option>"+filtersSet[k][l]+"</option>");
                                }
                            }

                            // attach event
                            $select.change(function(){
                                resetFilters();
                                resetSearch();
                            });
                            $filtersRow.append($filterCell);
                        }
                        return rows;
                    }
                    function resetFilters(){
                        methods[ "clearFilter" ].apply($self);
                        var $filtersRow = $table.children().children()[1];

                        $("select",$filtersRow).each(function() {
                            if($(this).val()) {
                                methods[ "filter" ].apply($self,[$(this).data("colIdx"), $(this).val(), true]);
                            }
                        });
                    }
                    function resetSearch(){
                        var query = $("#smart-table-search-input").val();
                        if(query) {
                            methods[ "search" ].apply($self, [query, true]);
                        }
                    }
                });

            },
            sort : function(columnIndex, desc ) {
                var $table = $($("table", this)[1]);
                var $rows = $table.children().children().slice(2);
                var wasSorted = false;
                $rows.sort(function(a, b) {
                    var sortColumnA = $($(a).children()[columnIndex]).text();
                    var sortColumnB = $($(b).children()[columnIndex]).text();
                    if(sortColumnA < sortColumnB){
                        wasSorted = true;
                        return -1;
                    }
                    if(sortColumnA > sortColumnB) {
                        wasSorted = true;
                        return 1;
                    }
                    return 0;
                });
                if(wasSorted) {
                    $table.find("tr:gt(1)").remove();
                    if(desc) $rows = $rows.get().reverse();
                    $table.append($rows);
                }
            },
            filter: function(columnIndex, value, visibleOnly){
                var $table = $($("table", this)[1]);
                var $rows = $table.children().children(visibleOnly?":visible":"").slice(2);
                $rows.each(function(){
                    if($($(this).children()[columnIndex]).text() === value) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            },
            search: function(value, visibleOnly){
                var $table = $($("table", this)[1]);
                var $rows = $table.children().children(visibleOnly?":visible":"").slice(2);

                $rows.each(function(){
                    var match = false;
                    var $cells = $(this).children();
                    for(var i = 0; i < $cells.length; i++) {
                        if($($cells[i]).text().indexOf(value) !== -1) {
                            match = true
                        }
                    }
                    if(match) {
                        $(this).show();
                    } else {
                        $(this).hide()
                    }
                });
            },
            clearFilter: function(){
                var $table = $($("table", this)[1]);

                var $rows = $table.children().children().slice(2);
                $rows.each(function(){
                    $(this).show();
                });
            }
        };

        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.smart_table' );
        }
    };

    $.fn.smart_table.defaults = {
        "tableDataCSV":"name,id,school,gpa,bndre,1,sjsu,4,gpa,cndre,2,sjsu,3,gpa,andre,3,sjsu,2,gpa,dndre,4,sjsu,1",
        "numberOfColumns": 4,
        "tableTitle": "The Table's Title"
    }
})(jQuery);