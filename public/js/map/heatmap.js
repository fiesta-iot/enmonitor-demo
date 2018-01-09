// Heatmap configuration
var heatmap_cfg = {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    "radius": 25,
    "maxOpacity": .8,
    // scales the radius based on map zoom
    "scaleRadius": false,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries 
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": false,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lon"
    lngField: 'lon',
    // which field name in your data represents the data value - default "value"
    valueField: 'value'
};


// Plot a heatmap according to the information selected on the side menu (phenomena and minimum value)
function displayHeatmap() {

    // Get active values from jQuery
    const active = $('input[name=heatmap_radio]:radio:checked');
    const active_slider = $('#' + $('input[name=heatmap_radio]:radio:checked').attr('id').replace('_heatmap', '_slider') +
        '.heatmap_slider_class').data('slider');

    let heatmap_output_data = {};
    console.log($('#' + $('input[name=heatmap_radio]:radio:checked').attr('id')));
    console.log($('#' + $('input[name=heatmap_radio]:radio:checked').attr('id').replace('_heatmap', '_slider') +
        '.heatmap_slider_class'));
    heatmap_output_data['max'] = active_slider.options.max;
    heatmap_output_data['data'] = [];
    heatmap_output_data['data'] = mapDataToHeatmap(active.val(), active_slider.getValue(),
        active_slider.options.max);

    console.log(active.val() + ' ' + heatmap_output_data['data'].length);
    // console.log(heatmap_output_data);
    heatmap_layer.setData(heatmap_output_data);
};


function mapDataToHeatmap(phenomenon, min, max) {

    let output = [];
    // const hit = _.filter(last_observations_array, { qk: 'm3-lite:' + phenomenon });
    const hit = _.filter(last_observations_array, function(item) {
        return ((item.qk === 'm3-lite:' + phenomenon) && (item.v >= min));
    });

    _.forEach(hit, function(item) {
        output.push({
            lat: item.lat,
            lon: item.lon,
            value: item.v
        });
    });

    return output;
};