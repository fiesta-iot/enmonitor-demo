# EnMonitor Demo

> (Dynamic) harvest of IoT-based data in a testbed agnostic manner. In layman’s terms, we aim at retrieving data from sensors coming from heterogeneous platforms (as the ones that compose the FIESTA-IoT federation) in a single and common solution.  

##Installation

We have chosen the Express (Node.js) framework to build the application server (backend). At client side, a typical combination of Javascript + HTML, including various popular libraries that deal with graphical outputs, such as Leaflet, Turf or D3.

So, the first step before running the application is to automatically download the required packages. For this, we have relied on two of the most widespread packages managers: npm and bower.

`npm install`
`bower install`


Now, you should have everything ready to run the server. 
`node server.js`
(Of course, there are many other alternatives, but we show here the legacy one)

Nonetheless, to make it work accordingly you still need to configure some stuff as, for security reasons, we have kept hidden our very own credentials of some of the services that the application will use at run time. For the sake of having them altogether, the file *config.yaml*, located in the *config* folder, contains the following elements:
```
production:
  iot_registry: 'https://platform.fiesta-iot.eu/iot-registry/api'
  mapbox_style: 'username/code' 
  mapbox_access_token: 'token'
  openam_user: 'user'
  openam_password: 'password'
  openam_authentication_endpoint: 'https://platform.fiesta-iot.eu/openam/json/authenticate'    
```

Where: 
- **production**: This is just the name given to the set of variables
- **iot_registry'**: Address of the iot-registry API [**No need to tamper**]
- **mapbox_style**: You must have an account in [Mapbox](https://www.mapbox.com/) in order to generate the output map. This first input represent the base layer over which the rest of the map will be built [**Necessary**]
- **mapbox_access_token**: This second field is required to authenticate yourself and load your personalized map [**Necessary**]
- **openam_user**: The FIESTA-IoT platform imposes that only registered users bound to the *experimenter* role are able to interact with the iot-registry API. Therefore, you have had to sign up [here](https://platform.fiesta-iot.eu/openam/XUI/#register/) and request for a promotion to *experimenter* (by default, you will be given a basic *observer* role) [**Necessary**]
- **openam_password**: Password tied to the above user [**Necessary**]
- **openam_authentication_endpoint**: As its name hints, through this address the system will check your identity, giving you a SSO token in case your credentials are correct

## Links

Apart from this application, we strongly recommend that you refer to the following list of documents, which will help you understand how this experiments works behind the curtains:

- [FIESTA-IoT 'in-house' experiments](http://fiesta-iot.eu/index.php/fiesta-experiments/)
- [Handbook for experimenters and extensions](http://moodle.fiesta-iot.eu/pluginfile.php/711/mod_resource/content/2/FIESTA-IoT_Handbook4ThirdParties_v1.0.pdf)
- [Moodle platform](http://moodle.fiesta-iot.eu/)

## Contact

For any kind of support or feedback, please [contact us](http://fiesta-iot.eu/index.php/support/)









