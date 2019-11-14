const battleOnlyForms = ['cherrim-sunshine', 'aegislash-blade', 'wishiwashi-school'];
const clickOutsideDropdownMenuListener = (e) => {
    $target = $(e.target);
    if (!$target.closest('.filter.active :not(label)').length) {
        $('.filter.active .dropdown-menu').parent().removeClass('active');
        document.removeEventListener('click', clickOutsideDropdownMenuListener);
    }
}
/**
 * Sorts the items of an array using the given sorting function.
 */
$.fn.sortChildren = function (sortingFunction) {
    return this.each(function () {
        const $children = $(this).children().get();
        $children.sort(sortingFunction);
        $(this).append($children);
    });

};
/**
 * Returns unique elements of an array.
 */
function set(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}
/**
 * Returns elements in first array not present in second array.
 */
function difference(array1, array2) {
    return array1.filter(function(x) {
        return array2.indexOf(x) < 0;
    });
}
/**
 * Returns unique elements of both arrays.
 */
function union(array1, array2) {
    return set(array1.concat(array2));
}
/**
 * Returns the string with the first letter capitalized.
 */
function capitalize(string) {
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return '';
}
/**
 * Converts a number to a roman numeral.
 */
function toRoman(number) {
    const vals = [10, 9, 5, 4, 1];
    const syms = ['X', 'IX', 'V', 'IV', 'I'];
    roman = '';
    for (let i = 0; i < syms.length; i++) {
        while (number >= vals[i]) {
            number -= vals[i];
            roman += syms[i];
        }
    }
    return roman;
}
/**
 * Joins an array in a pretty human-readable format. Example: '1, 2, 3, and 4'
 */
function prettyJoin(array) {
    if (array.length == 1) {
        return array[0];
    } else if (array.length > 1) {
        var oxfordComma = (array.length == 2) ? '' : ',';
        return array.slice(0, -1).join(', ') + oxfordComma + ' and ' + array.pop();
    }
    return '';
}
/**
 * Handles the 'change' event on checkboxes.
 */
function changeCheckbox() {
    var $this = $(this);
    var isRadio = $this.attr('type') == 'radio';
    var name = $this.attr('name');
    var $button = $('#' + name + '-filter');
    if (isRadio) {
        // Mark all others unchecked
        $('input[name="' + name + '"]:not([value="' + $this.val() + '"])').each(function() {
            $(this).prop('checked', false).parent().removeClass('active');
        });
    }
    if (this.checked) {
        $this.parent().addClass('active');
        if ($this.val() == 'all') {
            // Select all
            $('input[name="' + name + '"]:not([value="all"])').each(function () {
                $(this).prop('checked', true).parent().addClass('active');
            });
        }
    } else {
        $this.parent().removeClass('active');
        if ($this.val() == 'all') {
            // Unselect all
            $('input[name="' + name + '"]:not([value="all"])').each(function () {
                $(this).prop('checked', false).parent().removeClass('active');
            });
        } else if (!isRadio) {
            // Mark 'Select All' as unchecked
            $('input[name="' + name + '"][value="all"]').prop('checked', false).parent().removeClass('active');
        }
    }
    // Mark 'Select All' as checked if all checked
    var options = $('input[name="' + name + '"]:not([value="all"])').length;
    var $checked = $('input[name="' + name + '"]:not([value="all"]):checked');
    if (options == $checked.length) {
        $('input[name="' + name + '"][value="all"]').prop('checked', true).parent().addClass('active');
        $button.text('All selected');
    } else {
        if ($checked.length == 0) {
            $button.text('None Selected');
        } else if ($checked.length == 1) {
            $button.text($('label[for="' + $checked.attr('id') + '"]').text());
        } else {
            $button.text($checked.length + ' Selected');
        }
    }
    // Do the thing
    if (name == 'dex') {
        setUnobtanaiblePokemon($this.val());
        $button.parent().removeClass('active');
    } else {
        filterPokemon();
    }
}
/**
 * Handles the 'click' event on the dropdown menu button.
 */
function deployDropdown() {
    var $parent = $(this).parent();
    if ($parent.hasClass('disabled')) {
        return;
    }
    var hasClass = $parent.hasClass('active');
    $('.filter').each(function() {
        $(this).removeClass('active');
    });
    if (hasClass) {
        $parent.removeClass('active');
    } else {
        $parent.addClass('active');
        document.addEventListener('click', clickOutsideDropdownMenuListener);
    }
}
/**
 * Creates a checkbox used for filtering Pokémon.
 */
function createCheckbox(type, name, value, checked=true, isRadio=false) {
    var $li = $('<li></li>')
        .attr('class', checked ? 'active' : '');
    $('<label></label>')
        .attr('for', 'filter-' + type + '-' + value)
        .text(name)
        .appendTo($li);
    $('<input />')
        .attr('id', 'filter-' + type + '-' + value)
        .attr('name', type)
        .attr('value', value)
        .prop('checked', checked)
        .attr('type', isRadio ? 'radio' : 'checkbox')
        .change(changeCheckbox)
        .appendTo($li);
    return $li;
}
/**
 * Creates a filter.
 */
function createFilter(type, name, inclSelectAll=true) {
    var $dropdown = $('<ol></ol>')
        .addClass('dropdown-menu');
    if (inclSelectAll) {
        $dropdown.append(createCheckbox(type, 'Select all', 'all'));
    }
    var $div = $('<div></div>')
        .attr('data-type', type)
        .addClass('filter');
    $('<label></gpabel>')
        .attr('for', type + '-filter')
        .text(name)
        .appendTo($div);
    $('<button></button>')
        .attr('id', type + '-filter')
        .text('All Selected')
        .click(deployDropdown)
        .appendTo($div);
    $div.append($dropdown);
    $('#filters').append($div);
    return $dropdown;
}
/**
 * Loads Pokémon data.
 */
function loadPokemon(pokemonData, typeData) {
    var $pokedex = $('#pokedex');
    $.each(pokemonData, function(i) {
        var type1 = pokemonData[i].type[0];
        var type2 = pokemonData[i].type.length == 1 ? null : pokemonData[i].type[1];
        var immune2 = [];
        var resists = [];
        var weak2 = [];
        var coverage = [];
        if (type2) {
            // Immunities are the union of each type's immunities
            immune2 = union(typeData[type1].immune2, typeData[type2].immune2);
            // Resistances are the union of the difference between each type's  resistances and weaknesses
            resists = union(
                difference(typeData[type1].resists, typeData[type2].weak2),
                difference(typeData[type2].resists, typeData[type1].weak2),
            );
            // Weaknesses are the union of the difference between each type's weaknesses and resistances
            weak2 = union(
                difference(typeData[type1].weak2, typeData[type2].resists),
                difference(typeData[type2].weak2, typeData[type1].resists),
            );
            // STAB coverage is the union of the types weakened by each type
            coverage = union(typeData[type1].weakens, typeData[type2].weakens);
        } else {
            // If there is no secondary type, copy effectiveness from primary type
            immune2 = typeData[type1].immune2;
            resists = typeData[type1].resists;
            weak2 = typeData[type1].weak2;
            coverage = (i == 'pyukumuku') ? [] : typeData[type1].weakens;
        }
        var $a = $('<a></a>')
            .attr('href', '#')
            .addClass('ms')
            .text(pokemonData[i].name);
        var version = pokemonData[i].ver || 'sword,shield';
        var evolution = pokemonData[i].nfe ? 'nfe' : 'fe';
        var tag = pokemonData[i].cat ? pokemonData[i].cat : 'nonlegend';
        var $li = $('<li></li>')
            .attr('data-id', pokemonData[i].id)
            .attr('data-pokemon', i)
            .attr('data-gen', pokemonData[i].gen)
            .attr('data-type', pokemonData[i].type)
            .attr('data-version', version)
            .attr('data-evolution', evolution)
            .attr('data-immune2', immune2)
            .attr('data-resists', resists)
            .attr('data-weak2', weak2)
            .attr('data-coverage', coverage)
            .attr('data-dex', pokemonData[i].dex['swsh'])
            .attr('data-tag', tag)
            .attr('title', pokemonData[i].name);
        if (parseInt(pokemonData[i].dex['swsh']) > 400) {
            $li.addClass('unobtainable');
        }
        $li.append($a);
        $li.click(function(e) {
            addToTeam($(this));
            e.preventDefault();
        });
        // Make Pokémon go up and down on mouse over
        var handle = 0;
        $li.hover(function() {
            var $this = $(this);
            // Change form of Cherrim, Aegislash, and Wishiwashi
            if ($this.attr('data-pokemon') == 'cherrim') {
                $this.attr('data-default', 'cherrim');
                $this.attr('data-pokemon', 'cherrim-sunshine');
            } else if ($this.attr('data-pokemon') == 'aegislash') {
                $this.attr('data-default', 'aegislash');
                $this.attr('data-pokemon', 'aegislash-blade');
            } else if ($this.attr('data-pokemon') == 'wishiwashi') {
                $this.attr('data-default', 'wishiwashi');
                $this.attr('data-pokemon', 'wishiwashi-school');
            }
            handle = setInterval(function() {
                $this.toggleClass('up');
            }, 150);
        }, function() {
            var $this = $(this);
            // Revert to original form
            if (battleOnlyForms.includes($this.attr('data-pokemon'))) {
                $this.attr('data-pokemon', $this.attr('data-default'))
            }
            $this.removeClass('up');
            clearInterval(handle);
        });
        $pokedex.append($li);
        if (pokemonData[i].giga) {
            $li = $li.clone(true);
            $li.attr('data-pokemon', i + '-giga');
            $li.attr('data-evolution', 'fe');
            $li.attr('data-version', pokemonData[i].giga);
            $li.attr('data-gen', '8');
            $li.attr('data-tag', 'giga');
            $pokedex.append($li);
        }
    });
    // Update current team with Pokémon from URL
    if (window.location.hash) {
        // Add Pokémon to team
        window.location.hash.substring(1).split('+').forEach(function(pokemon) {
            addToTeam($('#pokedex [data-pokemon="' + pokemon + '"]'));
        });
        updateTeamHash();
    }
    // Sort Pokémon
    $('#pokedex').sortChildren((a, b) =>
        parseInt(a.getAttribute('data-dex')) - parseInt(b.getAttribute('data-dex')) ||
        parseInt(a.getAttribute('id')) - parseInt(b.getAttribute('id'))
    );
}
/**
 * Loads type data.
 */
function loadType(typeData) {
    // Create type filter
    var $typeDropdown = $('.filter[data-type="type"] .dropdown-menu');
    var $excludeDropdown = $('.filter[data-type="exclude-type"] .dropdown-menu');
    // Populate team type analysis tables
    $.each(typeData, function(type) {
        var name = capitalize(type);
        var $tr = $('<tr></tr>')
            .attr('data-type', type)
            .attr('data-who', '');
        $tr.append($('<th data-slot="1">' + name + '</th>'));
        $tr.append($('<td>0</td>'));
        $tr.appendTo($('#team-immunities tbody'));
        $tr.clone().appendTo($('#team-resistances tbody'));
        $tr.clone().appendTo($('#team-weaknesses tbody'));
        $tr.clone().appendTo($('#team-coverage tbody'));
        $typeDropdown.append(createCheckbox('type', name, type));
        $excludeDropdown.append(createCheckbox('exclude-type', name, type, false));
        typeData[type].weakens = []; var i = 0;
        $.each(typeData, function(defendingType) {
            if (typeData[defendingType].weak2.includes(type)) {
                typeData[type].weakens[i++] = defendingType;
            }
        });
    });
    // Load Pokémon
    $.getJSON('https://plan.pokemonteams.io/static/pokemon.json', pokemonData => loadPokemon(pokemonData, typeData));
}
function filterPokemon() {
    $('#pokedex [data-pokemon]').addClass('filtered');
    // get selected generations
    var gens = []; var i = 0;
    $('#gen-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        gens[i++] = $(this).val();
    });
    var types = []; i = 0;
    $('#type-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        types[i++] = $(this).val();
    });
    var excludedTypes = []; i = 0;
    $('#exclude-type-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        excludedTypes[i++] = $(this).val();
    });
    var evolutions = []; i = 0;
    $('#evolution-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        evolutions[i++] = $(this).val();
    });
    var versions = []; i = 0;
    $('#version-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        versions[i++] = $(this).val();
    });
    var tags = []; i = 0;
    $('#tag-filter + .dropdown-menu .active input:not([value="all"])').each(function() {
        tags[i++] = $(this).val();
    });
    var query = $("#search-bar").val().toLowerCase();
    $('#pokedex li').each(function() {
        var $this = $(this);
        var type = $this.attr('data-type').split(',');
        var hasType = types.includes(type[0]) || (type[1] && types.includes(type[1]));
        var hasExcludedType = excludedTypes.includes(type[0]) || (type[1] && excludedTypes.includes(type[1]));
        var matchesQuery = query.length == 0 || $this.attr('title').toLowerCase().indexOf(query) >= 0 || $this.attr('data-pokemon').toLowerCase().indexOf(query) >= 0;
        if (matchesQuery && (
            gens.includes($this.attr('data-gen')) &&
            evolutions.includes($this.attr('data-evolution')) &&
            versions.includes($this.attr('data-version')) &&
            tags.includes($this.attr('data-tag')) &&
            hasType && !hasExcludedType)
        ) {
            $this.removeClass('filtered');
        } else {
            $this.addClass('filtered');
        }
    });
}
/**
 * Adds the unobtainable class to Pokémon that cannot be caught in the current dex.
 */
function setUnobtanaiblePokemon(dex) {
    $('article[data-pokedex]').attr('data-pokedex', dex);
    // Hide/Show Pokémon from Pokédex
    $('#pokedex li').each(function() {
        var $this = $(this);
        if (parseInt($this.attr('data-dex-' + dex)) > 0) {
            $this.removeClass('unobtainable');
        } else {
            $this.addClass('unobtainable');
            if ($this.hasClass('picked')) {
                removeFromTeam($this.attr('data-pokemon'));
            }
        }
    });
    // Sort Pokédex
    $('#pokedex').sortChildren((a, b) => parseInt(a.getAttribute('data-dex-' + dex)) > parseInt(b.getAttribute('data-dex-' + dex)) ? 1 : -1);
    updateTeamHash();
    return;
}
/**
 * Returns a random number.
 */
function getRandomNumber(upperBound) {
    return Math.floor((Math.random() * upperBound) + 1);
}
/**
 * Returns unique elements of an array.
 */
function randomizeTeam(e) {
    e.preventDefault();
    // Clear search bar
    if ($('#search-bar').val().length > 0) {
        $('#search-bar').val('');
        filterPokemon();
    }
    // Clear current team
    $('#slots [data-pokemon]').each(function() {
        removeFromTeam($(this));
    });
    // Select Pokémon that can be obtained in the current, are not filtered out and are not already picked
    var $filteredPkmn = $('#pokedex [data-pokemon]:not(.unobtainable):not(.filtered):not(.picked)');
    if ($filteredPkmn.length > 0) {
        var teamSize = 6;
        // If there are less than 6 available Pokémon, use that number
        if ($filteredPkmn.length < teamSize) {
            teamSize = $filteredPkmn.length;
        }
        for (let i = 0; i < teamSize; i++) {
            var randomNumber = getRandomNumber($filteredPkmn.length) - 1;
            addToTeam($filteredPkmn.eq(randomNumber));
            $filteredPkmn = $('#pokedex [data-pokemon]:not(.unobtainable):not(.filtered):not(.picked)');
        }
    }
}
/**
 * Adds a Pokémon to the team.
 */
function addToTeam(who, position) {
    var $this = (typeof who === 'string') ? $('#pokedex [data-pokemon="' + who + '"]') : who;
    var pokemon = $this.attr('data-pokemon');
    if (!pokemon || $this.hasClass('unobtainable')) {
        return;
    } else if (battleOnlyForms.includes(pokemon)) {
        pokemon = $this.attr('data-default');
    }
    if (!position) {
        position = -1;
    }
    var name = $this.attr('title')
    // Find first empty slot (or specific slot if position was given)
    var $slot = (position >= 0) ? $('#slots').children().eq(position) : $('#slots [data-pokemon=""]').first();
    // If there is no empty slot, remove Pokemon on first slot
    if ($slot.length <= 0) {
        removeFromTeam($('#slots [data-pokemon]').first())
        $slot = $('#slots [data-pokemon=""]').first();
    }
    // Transfer data to slot
    var type = $this.attr('data-type').split(',');
    var type1 = capitalize(type[0]);
    var type2 = capitalize(type.length == 1 ? null : type[1]);
    $slot.attr('data-pokemon', pokemon);
    $slot.attr('data-type', type);
    $slot.attr('data-gen', $this.attr('data-gen'));
    $slot.find('figure').attr('title', name);
    var $info = $slot.find('.info');
    $info.find('.name').text(name);
    $info.find('.type[data-slot="1"]')
        .attr('title', type1)
        .text(type1);
    $info.find('.type[data-slot="2"]')
        .attr('title', type2)
        .text(type2);
    // Hide picked Pokémon
    $this.addClass('picked');
    // Update stuff
    updateTeamTypeAnalysis(pokemon);
    updateTeamHash();
}
/**
 * Removes a Pokémon from the team.
 */
function removeFromTeam(who) {
    var $this = (typeof who === 'string') ? $('#slots [data-pokemon="' + who + '"]') : who;
    var pokemon = $this.attr('data-pokemon');
    if (!pokemon) {
        return;
    }
    // Make Pokémon visible again
    $('#pokedex [data-pokemon="' + pokemon +  '"]').removeClass('picked');
    // Reset slot
    $this.attr('data-pokemon', '');
    $this.attr('data-type', '');
    $this.attr('data-gen', '');
    $this.find('figure').attr('title', '');
    var $info = $this.find('.info');
    $info.find('.name').text('???');
    $info.find('.type[data-slot="1"]')
        .attr('title', '')
        .text('');
    $info.find('.type[data-slot="2"]')
        .attr('title', '')
        .text('');
    // Send slot to last place
    $('#slots').append($this);
    // Update stuff
    updateTeamTypeAnalysis(pokemon, 'remove');
    updateTeamHash();
}
/**
 * Updates the team's type analysis.
 */
function updateTeamTypeAnalysis(pokemon, action) {
    if (action === undefined) {
        action = 'add';
    }
    if (action == 'ignore') {
        return;
    }
    var $pokemon = $('#pokedex [data-pokemon="' + pokemon + '"]');
    var name = $pokemon.attr('title');
    if ($pokemon.length < 1) {
        $pokemon = $('#pokedex [data-default="' + pokemon + '"]');
    }
    $pokemon.attr('data-coverage').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, action, name, '#team-coverage', 
            'hits ' + capitalize(type) + ' types with super effective with STAB damage!',
            'hit ' + capitalize(type) + ' types with super effective with STAB damage!')
    );
    $pokemon.attr('data-weak2').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, action, name, '#team-weaknesses',
            'is weak to ' + capitalize(type) + ' types!',
            'are weak to ' + capitalize(type) + ' types!')
    );
    $pokemon.attr('data-immune2').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, action, name, '#team-immunities',
        'is immune to ' + capitalize(type) + ' types!',
        'are immune to ' + capitalize(type) + ' types!')
    );
    $pokemon.attr('data-resists').split(',').forEach(
        type => updateTeamTypeAnalysisTable(type, action, name, '#team-resistances',
        'resists ' + capitalize(type) + ' types!',
        'resist ' + capitalize(type) + ' types!')
    );
}
/**
 * Updates the team's type analysis table.
 */
function updateTeamTypeAnalysisTable(type, action, contributor, tableId, textSingular, textPlural) {
    if (!type) {
        return;
    }
    var $tr = $(tableId + ' [data-type="' + type + '"]');
    // Keep track of who is contributing
    var who = $tr.attr('data-who');
    if (who.length == 0 && action == 'add') {
        who = [contributor];
    } else {
        who = who.split(',');
        if (action == 'remove') {
            who = who.filter(pokemon => pokemon !== contributor);
        } else if (who.length > 0) {
            who.push(contributor);
        }
    }
    $tr.attr('data-who', who.join(','));
    // Update current number of contributing Pokémon
    var $td = $tr.find('td');
    var num = parseInt($td.text());
    num += (action == 'remove') ? -1 : 1;
    $td.text(num);
    // Update text
    var contributors = '';
    if (who.length > 0) {
        contributors = '(' + prettyJoin(who) + ') ';
    }
    $tr.attr('title', num + ' Pokémon ' + contributors + ((num == 1) ? textSingular : textPlural));
}
function makeTeamSlotDraggable($slot) {
    var dragSrcEl = null;
    $slot.on('dragstart', function(e) {
        console.log('start');
        dragSrcEl = this;
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        e.originalEvent.dataTransfer.setData('text/html', null);
    });
    $slot.on('dragover', function(e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'move';
        return false;
    });
    $slot.on('dragenter', function() {
        console.log('enter');
    });
    $slot.on('dragleave', function() {
        console.log('leave');
    });
    $slot.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (dragSrcEl != this && $(this).attr('data-pokemon').length > 0) {
            var source = $(dragSrcEl).attr('data-pokemon');
            var target = $(this).attr('data-pokemon');
            addToTeam(
                $('#pokedex [data-pokemon="' + source + '"]'),
                $('#slots [data-pokemon]').index(this)
            );
            addToTeam(
                $('#pokedex [data-pokemon="' + target + '"]'),
                $('#slots [data-pokemon]').index(dragSrcEl)
            );
        }
        return false;
    });
    $slot.on('dragend', function() {
        console.log('end');
    });
}
/**
 * Updates the team's URL.
 */
function updateTeamHash() {
    var teamMembers = [];
    $('#slots li:not([data-pokemon=""])').each(function() {
        teamMembers.push($(this).attr('data-pokemon'));
    });
    if (window.history.replaceState) {
        window.history.replaceState(null, null, location.origin + '/#' + teamMembers.join('+'));
    } else {
        window.location.hash = teamMembers.join('+');
    }
    $('#copy-url input').val(document.URL);
}
function createFilters() {
    // Dex
    var $dropdown = createFilter('dex', 'Game', false);
    $dropdown.parent().addClass('disabled');
    $dropdown.append(createCheckbox('dex', 'Sword & Shield', 'swsh', true, true));
    $('#dex-filter').text('Sword & Shield');
    // Type
    createFilter('type', 'Type');
    // Evolution
    $dropdown = createFilter('evolution', 'Evolution');
    $dropdown.append(createCheckbox('evolution', 'Not Fully Evolved', 'nfe'));
    $dropdown.append(createCheckbox('evolution', 'Fully Evolved', 'fe'));
    // Generation
    $dropdown = createFilter('gen', 'Generation');
    for (let i = 1; i <= 8; i++) {
        $dropdown.append(createCheckbox('gen', 'Generation ' + toRoman(i), i));
    }
    // Version
    $dropdown = createFilter('version', 'Version');
    $dropdown.append(createCheckbox('version', 'Both', 'sword,shield'));
    $dropdown.append(createCheckbox('version', 'Sword', 'sword'));
    $dropdown.append(createCheckbox('version', 'Shield', 'shield'));
    // Exclude Type
    $dropdown = createFilter('exclude-type', 'Exclude Type');
    $dropdown.find('.active').removeClass('active').find('input').prop('checked', false);
    $('#exclude-type-filter').text('None Selected');
    // Category
    $dropdown = createFilter('tag', 'Tag');
    $dropdown.append(createCheckbox('tag', 'Non-Legendary', 'nonlegend'));
    $dropdown.append(createCheckbox('tag', 'Sub-Legendary', 'sublegend'));
    $dropdown.append(createCheckbox('tag', 'Legendary', 'legend'));
    $dropdown.append(createCheckbox('tag', 'Gigantamax', 'giga'));
    var $div = $('<div></div>')
        .attr('data-type', 'name')
        .addClass('filter');
    $('<label></label>')
        .attr('for', 'search-bar')
        .text('Search')
        .appendTo($div);
    $('<input />')
        .attr('id', 'search-bar')
        .attr('type', 'search')
        .attr('placeholder', 'by Pokémon name')
        .on('input', filterPokemon)
        .appendTo($div);
    $('#filters').append($div);
}
$(document).ready(function(){
    // Create team slots
    var $team = $('#team #slots');
    var $slot = $team.find('li');
    $slot.find('figure').wrap('<div class="wrap"></div>');
    $slot.click(function(e) {
        removeFromTeam($(this));
        e.preventDefault();
    });
    for (let i = 0; i < 5; i++) {
        $slot.clone(true).appendTo($team);
    }
    // Create filters
    createFilters();
    // Load types and Pokémon
    $.getJSON('https://plan.pokemonteams.io/static/types.json', loadType);
    $('#randomize').click(randomizeTeam);
    // Show/hide team's weaknesses
    $('#type-analysis .button').click(function(e) {
        e.preventDefault();
        $('#type-analysis .button').toggleClass('hidden');
        $(this).siblings('table').each(function() {
            $(this).toggleClass('hidden');
        });
    });
    // Set current URL
    $('#copy-url input').val(document.URL);
    /* $('#take-screenshot').click(function(e) {
        $('#loader').fadeIn();
        var num = $('#slots li:not([data-pokemon=""])').length;
        html2canvas(document.querySelector('#slots'), {
            backgroundColor: null,
            width: 192*num
        }).then(canvas => {
            $('#loader').fadeOut('slow');
            //document.body.appendChild(canvas);
            var a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                a.download = 'myteam.png';
            } else {
                a.target = '_blank';
            }
            a.click();
            //window.open(canvas.toDataURL('image/png'), '_blank');

        });
        e.preventDefault();
    }); */
});
// Copy feature
var clipboard = new ClipboardJS('#copy-url a');
clipboard.on('success', function() {
    var $button = $('#copy-url a');
    $button.text('Copied!');
    setTimeout(function() {
        $button.text('Copy');
    }, 3000);
});
