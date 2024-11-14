export const query_value1:string = `POST ai_platform_log_version/_search
{
  "size": "10",
  "sort": {
    "createTime": "desc"
  },
  "track_total_hits": true, 
  "query": {
    "bool": {
      "filter": {
        "range": {
          "createTime": {
            "gte": "2024-09-18 00:00:00",
            "lte": "2024-09-30 17:50:00"
          }
        }
      },
      "minimum_should_match": 1,
      "should": [
        {
          "match_phrase": {
            "param":"translate AAD0260278"
          }
        }
      ],
      "must": []
    }
  }
}
`
export const result_value1:string = `{
  "took" : 261,
  "timed_out" : false,
  "_shards" : {
    "total" : 15,
    "successful" : 15,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 535,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "cCpQNJIBIauANC36PCbu",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.223",
          "message" : "翻译标题描述执行完毕"
        },
        "sort" : [
          1727483325223
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "cSpQNJIBIauANC36PCbu",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.223",
          "message" : "翻译完毕 - 老品"
        },
        "sort" : [
          1727483325223
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "bypQNJIBIauANC36PCbu",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.223",
          "message" : """postTitleDescPdm success: {"code":200,"data":[],"info":"Successful"}"""
        },
        "sort" : [
          1727483325223
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "iypQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.172",
          "message" : """postTitleDescPdm success: {"code":200,"data":[],"info":"Successful"}"""
        },
        "sort" : [
          1727483325172
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "jCpQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.172",
          "message" : """尝试提交标题描述{"langueCode":"es","spu":"AAD0260278","describe":"Descripción: *Nuevo y de alta calidad * Hecho de materiales de alta calidad, * funciona con faros LED para eléctrico bicicletas, vehículos eléctricos compartidos y motocicletas * Todo el material de aluminio * LED súper brillante * Diseño impermeable * 90 decibelios * Instalación sin pérdidas Especificación: Material: al6061 Color: Negro Peso: aproximadamente 60 g / enchufe establecido: 4 pines, 3 pines impermeable optiops El paquete incluye: 1x luces Nota: 1. El color real del artículo puede ser ligeramente diferente de las imágenes que se muestran en el sitio web causado por muchos factores como el brillo de tu monitor y el brillo de la luz.\n2. Por favor, permita una ligera desviación de medición manual para el datos.","type":1,"title":"Luz delantera Ebike  para 36V 48V Batería Bocina Faro Luz delantera funcional"}"""
        },
        "sort" : [
          1727483325172
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "hypQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.127",
          "message" : """postTitleDescPdm success: {"code":200,"data":[],"info":"Successful"}"""
        },
        "sort" : [
          1727483325127
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "iCpQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.127",
          "message" : """尝试提交标题描述{"langueCode":"it","spu":"AAD0260278","describe":"Descrizione: *Nuovo e di alta qualità *Realizzato con materiali di alta qualità, *funziona su fari a LED per elettrico biciclette, veicoli elettrici condivisi e moto *Tutto il materiale in alluminio *LED super luminoso *Design impermeabile *90 decibel *Specifiche di installazione senza perdita: Materiale: al6061 Colore: Nero Peso: circa 60 g/spina set: 4 pin, opzioni impermeabili a 3 pin Il pacchetto include: 1x luci Nota: 1. Il colore reale dell'articolo potrebbe essere leggermente diverso dalle immagini mostrate sul sito a causa di molti fattori come la luminosità del monitor e la luminosità della luce.\n2. Si prega di consentire una leggera deviazione di misurazione manuale per il dati.","type":1,"title":"Luce anteriore Ebike  per 36 V Faro tromba batteria 48V luce anteriore funzionale"}"""
        },
        "sort" : [
          1727483325127
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "hSpQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.082",
          "message" : """postTitleDescPdm success: {"code":200,"data":[],"info":"Successful"}"""
        },
        "sort" : [
          1727483325082
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "hipQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.082",
          "message" : """尝试提交标题描述{"langueCode":"de","spu":"AAD0260278","describe":"Beschreibung: * Nagelneu und hochwertig * Hergestellt aus hochwertigen Materialien, * funktioniert mit LED-Scheinwerfern für elektrische Fahrräder, gemeinsame Elektrofahrzeuge und Motorrad * Vollaluminiummaterial * Superhelle LED * Wasserdichtes Design * 90 Dezibel * Verlustfreie Installation Spezifikation: Material: al6061 Farbe: Schwarz Gewicht: ca. 60 g / Set Stecker: 4 Pin, 3 Pin wasserdichte Optiops Paket beinhaltet: 1x Lichter Hinweis: 1. Die tatsächliche Farbe des Artikels kann aufgrund vieler Faktoren wie Helligkeit Ihres Monitors und Lichthelligkeit geringfügig von den auf der Website gezeigten Bildern abweichen.\n2. Bitte erlauben Sie leichte manuelle Messabweichungen für die Daten.","type":1,"title":"Ebike Frontlicht  für 36V 48V Batterie Hupe Scheinwerfer Funktionsfähiges Frontlicht"}"""
        },
        "sort" : [
          1727483325082
        ]
      },
      {
        "_index" : "ai_platform_log_version1",
        "_type" : "_doc",
        "_id" : "hCpQNJIBIauANC36NxcC",
        "_score" : null,
        "_source" : {
          "code" : 200,
          "param" : "translate AAD0260278",
          "level" : "info",
          "createTime" : "2024-09-28 00:28:45.009",
          "message" : """尝试提交标题描述{"langueCode":"fr","spu":"AAD0260278","describe":"Description : * Neuf et de haute qualité * Fait de matériaux de haute qualité, * il fonctionne sur les phares à LED pour électrique vélos, véhicules électriques partagés et moto *Tout matériau en aluminium * LED super lumineuse *Conception étanche *90 décibels * Spécifications d'installation sans perte: Matériau: al6061 Couleur: Noir Poids: environ 60 g / prise réglée: 4 broches, optiops étanches à 3 broches Le paquet comprend: 1x lumières Note: 1. La couleur réelle de l'article peut être légèrement différente des photos présentées sur le site Web en raison de nombreux facteurs tels que la luminosité de votre moniteur et la luminosité de la lumière.\n2. Veuillez permettre un léger écart de mesure manuelle pour le données.","type":1,"title":"Ebike Front Light  pour 36V Phare klaxon à batterie 48 V feu avant fonctionnel"}"""
        },
        "sort" : [
          1727483325009
        ]
      }
    ]
  }
}
`

export const queryTemplate = `POST ai_platform_log_version/_search
{
  "size": "200",
  "sort": {
    "createTime": "desc"
  },
  "track_total_hits": true, 
  "query": {
    "bool": {
      "filter": {
        "range": {
          "createTime": {
            "gte": "{%startTime=2024-10-09 10:10:00%}",
            "lte": "{%endTime=2024-10-19 22:32:24%}"
          }
        }
      },
      "minimum_should_match": 1,
      "should": [
        {
          "match_phrase": {
            "message":"{%msg=消息%}"
          }
        }
      ],
      "must": []
    }
  }
}`

export const titleTemplate = "模板查询"