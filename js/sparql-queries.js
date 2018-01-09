var discovery = require('./resource-discovery')

module.exports = {

    resource_discovery: 'PREFIX m3-lite: <http://purl.org/iot/vocab/m3-lite#>' +
        'PREFIX iot-lite: <http://purl.oclc.org/NET/UNIS/fiware/iot-lite#>' +
        'PREFIX ssn: <http://purl.oclc.org/NET/ssnx/ssn#> ' +
        'PREFIX geo:  <http://www.w3.org/2003/01/geo/wgs84_pos#> ' +
        'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?sensor ?qk  ?unit ?lat ?long ?endp ?deployment ?type ' +
        'WHERE { ' +
        '?deployment a ssn:Deployment . ' +
        '{ ' +
        '?dev ssn:hasDeployment ?deployment . ' +
        '?dev ssn:onPlatform ?platform. ' +
        '?platform geo:location ?point . ' +
        '?point geo:lat ?lat . ' +
        '?point geo:long ?long . ' +
        '?dev ssn:hasSubSystem ?sensor  ' +
        '} ' +
        'UNION ' +
        '{ ' +
        '?sensor ssn:hasDeployment ?deployment . ' +
        '?sensor ssn:onPlatform ?platform. ' +
        '?platform geo:location ?point . ' +
        '?point geo:lat ?lat . ' +
        '?point geo:long ?long . ' +
        '} ' +
        '?sensor iot-lite:hasQuantityKind ?qkr . ' +
        '?qkr rdf:type ?qk .  ' +
        '?sensor iot-lite:hasUnit ?unitr . ' +
        '?unitr rdf:type ?unit . ' +
        '?sensor a ?type ' +
        'OPTIONAL { ' +
        '?sensor iot-lite:exposedBy ?serv . ' +
        '?serv iot-lite:endpoint ?endp . ' +
        '} ' +
        'VALUES ?qk {VVVVV}.' +
        '} ',


    observation_window: 'Prefix ssn: <http://purl.oclc.org/NET/ssnx/ssn#> ' +
        'Prefix iot-lite: <http://purl.oclc.org/NET/UNIS/fiware/iot-lite#> ' +
        'Prefix dul: <http://www.loa.istc.cnr.it/ontologies/DUL.owl#> ' +
        'Prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>' +
        'Prefix time: <http://www.w3.org/2006/time#>' +
        'Prefix m3-lite: <http://purl.org/iot/vocab/m3-lite#>' +
        'Prefix xsd: <http://www.w3.org/2001/XMLSchema#>' +
        'Prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
        'select ?s ?t ?v ?lat ?lon ?qk ?u ' +
        'where { ' +
        '?o a ssn:Observation.' +
        '?o ssn:observedBy ?s. ' +
        '?s iot-lite:hasUnit ?unit.' +
        '?unit rdf:type ?u . ' +
        '?o geo:location ?point. ' +
        '?o ssn:observedProperty ?qkr. ' +
        '?qkr rdf:type ?qk. ' +
        'Values ?qk {m3-lite:AirTemperature m3-lite:TemperatureSoil m3-lite:Illuminance m3-lite:AtmosphericPressure m3-lite:RelativeHumidity m3-lite:WindSpeed m3-lite:SoundPressureLevel m3-lite:SoundPressureLevelAmbient m3-lite:Sound m3-lite:SolarRadiation m3-lite:ChemicalAgentAtmosphericConcentrationCO m3-lite:ChemicalAgentAtmosphericConcentrationO3  m3-lite:ChemicalAgentAtmosphericConcentrationAirParticles m3-lite:ChemicalAgentAtmosphericConcentrationNO2} ' +
        '?point geo:lat ?lat. ' +
        '?point geo:long ?lon. ' +
        '?o ssn:observationResult ?or.' +
        '?or  ssn:hasValue ?val. ' +
        '?val dul:hasDataValue ?v. ' +
        '?o ssn:observationSamplingTime ?ti. ' +
        '?ti time:inXSDDateTime ?t. ' +
        'FILTER(xsd:dateTime(?t) > "TTTTT"^^xsd:dateTime) ' +
        '} group by ?s ?t ?v ?lat ?lon ?qk ?u ' +
        'order by ?s desc(?ti) ' +
        'limit 100 ',

    tally: 'PREFIX ssn: <http://purl.oclc.org/NET/ssnx/ssn#>' +
        'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
        'SELECT  (COUNT(DISTINCT ?dep) AS ?deployments)' +
        '(COUNT(DISTINCT ?dev) AS ?devices) ' +
        '(COUNT(DISTINCT ?sens) AS ?sensors) ' +
        '(COUNT(DISTINCT ?obs) AS ?observations) ' +
        'WHERE { ' +
        '{?dep a ssn:Deployment}' +
        'UNION' +
        '{?dev a ssn:Device}' +
        'UNION' +
        '{?sens rdf:type/rdfs:subClassOf ssn:SensingDevice}' +
        'UNION' +
        '{?obs a ssn:Observation}' +
        '}'
};