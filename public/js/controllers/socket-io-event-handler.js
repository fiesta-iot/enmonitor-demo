  // All the socket-io communication between client and server will be handled in this file.

  socket.on('mapbox_credentials_response', function(data) {
      mapbox_style = data.style;
      mapbox_access_token = data.token;
      initMap();
  })

  // Get the registered nodes from the server   ()     
  socket.on('resource_discovery_resp', function(data) {

      if (!_.isEmpty(data)) {
          parseResourceDiscoveryData(data);
          socket.emit('resource_latency_req');
      } else {
          alert('Resources array empty. Try later')
      }
  });


  socket.on('gather_stats_resp', function(data) {
      if (!_.isEmpty(data)) {

          var log_message = new Date().toISOString() + " - Statistics retrieved (SPARQL) : ";
          _.forEach(_.keys(data), function(o) {
              $('#' + o).html(String(data[o]));
              log_message += o + "  (" + data[o] + "), ";
          });

      }
  });


  socket.on('last_observation_resp', function(data) {

      _.forEach(data.items, function(o) {
          //   $('#timestamp_' + o.qk.split(':')[1]).html(o['timestamp']);
          //   $('#value_' + o.qk.split(':')[1]).html(o['value']);
          $('#timestamp_' + o.s.substring(o.s.length - 18, o.s.length - 2)).html(o['timestamp']);
          $('#value_' + o.s.substring(o.s.length - 18, o.s.length - 2)).html(o['value'].toFixed(4));
      })

      return 1;
  });

  socket.on('observations_get_all_resp', function(data) {
      last_observations_array = data;
      weatherStationUpdate();
      return 1;
  });


  socket.on('average_observation_resp', function(data) {
      console.log(data);
      WeatherStationAverage(data);
  });

  socket.on('get_history_resp', function(data) {

      // Sort data
      const sorted = _.sortBy(data, function(o) {
          return new Date(o.t);
      });

      ViolinPlot(_.forEach(sorted, function(o) {
          let aux = new Date(o.t);
          aux = new Date(aux.getFullYear(), aux.getMonth(), aux.getUTCDate(), aux.getHours(), 0, 0);
          o.t = aux.getFullYear().toString().substring(2, 4) + '/' +
              (aux.getMonth() + 1).toString() + '/' + aux.getUTCDate() + '-' + aux.getHours();
      }));
  });


  socket.on('bcast', function(data) {
      console.log('Broadcast message received');

  });


  socket.on('server_close', function(data) {
      console.log('[TODO] Server disconnection handler');
      $('#weather_AirTemperature').html('0.00');
      socket.disconnect();
  });