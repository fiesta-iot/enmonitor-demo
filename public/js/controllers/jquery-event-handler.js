var toggle_to_phenomena = {
    'temperature_toggle': ['m3-lite:AmbientTemperature', 'm3-lite:AirTemperature', 'm3-lite:TemperatureSoil',
        'm3-lite:TemperatureAmbient', 'm3-lite:BuildingTemperature'
    ],
    'illuminance_toggle': ['m3-lite:Illuminance'],
    'atm_toggle': ['m3-lite:AtmosphericPressure'],
    'humidity_toggle': ['m3-lite:RelativeHumidity'],
    'windspeed_toggle': ['m3-lite:WindSpeed'],
    'sound_toggle': ['m3-lite:Sound', 'm3-lite:SoundPressureLevel', 'm3-lite:SoundPressureLevelAmbient'],
    'sun_toggle': ['m3-lite:SolarRadiation'],
    'o3_toggle': ['m3-lite:ChemicalAgentAtmosphericConcentrationO3'],
    'co_toggle': ['m3-lite:ChemicalAgentAtmosphericConcentrationCO']
}

function jqueryHandlerInit() {
    // Bootstrap toogle handlers
    $('.phenomena-toggle-group').each(function(index, item) {
        var element = {};
        element['key'] = $(this).attr('id');
        element['value'] = $(this).prop('checked');
        element['taxonomy'] = [];

        _.forEach(toggle_to_phenomena[$(this).attr('id')], function(value) {
            element['taxonomy'].push(value)
        });
        phenomena_toggle_group.push(element);
        $("#" + $(this).attr('id')).change(function() {
            hit = _.find(phenomena_toggle_group, {
                'key': $(this).attr('id')
            });
            hit['value'] = $(this).prop('checked');
        });
    });

    // "Send query" button event handler: 
    // Local discovery --> Loop and filter the resources 
    // Remote discovery --> Will take the enabled phenomena in the toggle group and will generate a new SPARQL
    // Future: Add coordinates to the object
    $('#send_discovery_query').on('click', function(e) {
        var query_parameters = {};
        query_parameters['phenomena'] = [];
        query_parameters['location'] = {}; //Todo

        _.forEach(_.filter(phenomena_toggle_group, {
            'value': true
        }), function(value) {
            _.forEach(value['taxonomy'], function(phenomenon) {
                query_parameters['phenomena'].push(phenomenon);
            })
        })

        discovery('local', query_parameters);

    });

    $('#heatmap_toggle').on('change', function() {
        if ($(this).prop('checked')) {
            displayHeatmap()
            heatmap_layer.addTo(leafletMap);
            if (active_nodes_overlay) {
                leafletMap.removeLayer(devices_layer);
            }
            if (active_clusters_overlay) {
                leafletMap.removeLayer(devices_cluster);
            }
        } else {
            leafletMap.removeLayer(heatmap_layer);
            devices_cluster.addTo(leafletMap);
        }
    });

    $('.heatmap_slider_class').slider({
        tooltip: 'never',
        // formatter: function(value) {
        //     return 'Current value: ' + value;
        // }
        // ticks: [0, 100, 200, 300, 400],
        // ticks_labels: ['$0', '$100', '$200', '$300', '$400'],
        // ticks_snap_bounds: 30
    });

    $('#heatmap_update').on('click', function(e) {
        displayHeatmap();
    });

    // When the user clicks on the "history" tab, the system processes and draws the corresponding graph
    $("a[href='#history']").on('show.bs.tab', function(e) {
        // displayHistoricValues();
        // socket.emit('get_history_req', {
        //     phenomenon: $('input[name=heatmap_radio]:radio:checked').val(),
        //     bounds: leafletMap.getBounds()
        // });
    });

    $('.dropdown-menu a').on('click', dropdownToggle);

    $('#history_update').on('click', function(e) {
        const map = {
            "Air Temperature": 'AirTemperature',
            "Illuminance": 'Illuminance',
            "Atmospheric Pressure": 'AtmosphericPressure',
            'Relative Humidity': 'RelativeHumidity',
            'Windspeed': 'WindSpeed',
            'Sound (noise)': 'SoundPressureLevel',
            'Solar radiation': 'SolarRadiation',
            'O3 concentration': 'ChemicalAgentAtmosphericConcentrationO3',
            'COc oncentration': 'ChemicalAgentAtmosphericConcentrationCO'
        };

        const phenomenon = $('#history_option').text().trim();

        socket.emit('get_history_req', {
            phenomenon: map[phenomenon],
            bounds: leafletMap.getBounds()
        });
    });

    // To fix 
    $(window).unload(function() {
        socket.disconnect();
        return "Handler for .unload() called.";
    });
}

function getDataTable(table, options) {
    if ($.fn.dataTable.isDataTable(table)) {
        return $(table).DataTable();
    } else {
        return $(table).DataTable(options === undefined ? {
            'bpaginate': true,
            'bFilter': true,
            'bLengthChange': false,
            'pageLength': 8,
            'retrieve': true
        } : options);
    }
};

function dropdownToggle() {

    // select the main dropdown button element
    // Fix the local/remote thing
    // var dropdown = $(this).parent().parent().prev();
    const dropdown = $('#history_option');

    // change the CONTENT of the button based on the content of selected option
    dropdown.html($(this).html() + '&nbsp;</i><span class="caret"></span>');
    // change the VALUE of the button based on the data-value property of selected option
    dropdown.val($(this).prop('data-value'));
}