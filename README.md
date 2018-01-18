# EnMonitor Demo

> IoT applications are usually built on top of proprietary platforms that collect data from IoT devices. Furthermore, most applications rely on proprietary datasets, coming from their own sources. Thereby needing to deal with issues like interoperability and heterogeneity in the data. A solution is to add another layer (a platform in the middle that addresses the above-mentioned issues) and then build applications that use data made available via such platforms. As a proof of concept, we present [EnMonitor](http://fiesta-iot.tlmat-unican.es/enmonitor-demo), a prototype application, that is built on top of one such platform, called FIESTA-IoT. The application provides citizens with an understanding of the environment they live in with both local and global surrounding view.

## Citation

> R. Agarwal, D. Farnandez , L. Sanchez, J. Lanza,  N. Georgantas, V. Issarny, "EnMonitor: Experimentation over Large-scale Semantically Annotated Federated IoT data environment", (Submitted) Deme track The Web Conference 2018 (WWW), Lyon

## Installation

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
  mapbox_style: '<username/code>' 
  mapbox_access_token: '<token>'
  openam_user: '<user>'
  openam_password: '<password>'
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

- [FIESTA-IoT Ontology](http://ontology.fiesta-iot.eu)
- [Handbook for experimenters and extensions](http://moodle.fiesta-iot.eu/pluginfile.php/711/mod_resource/content/5/FIESTA-IoT_Handbook4ThirdParties_v4.0.pdf)
- [Moodle platform](http://moodle.fiesta-iot.eu/)

## Contact

For any kind of support or feedback, please [contact us](http://fiesta-iot.eu/index.php/support/)









