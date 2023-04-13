A new object has been added to the 'client_safe' object in the 'settings' object which may be where all the app plugins are stored and referenced from.

```JSON
"client_safe": {
            "plugins": {
                "apiconnector2": true
            },
```

The API Connector details, such as the added API call and GET request, have been added at the same nested level as the 'plugins' object. 

This object called 'apiconnector2' contains the API call I created, identified as bTGyn, with two inner objects, 'calls' and 'human'. 

The 'calls' object contains the GET request I created, with "name": "Test GET call". 

The 'human' object contains the name I chose for the API, "human": "Test API". 

The "ret_value" appears to reference that this is an api, then the top level name of the apiconnector2 plugin, then the Bubble id for the API call, then the Bubble id for the GET request : api.apiconnector2.bTGyn.bTGyr. 

```JSON
"apiconnector2": {
                "bTGyn": {
                    "calls": {
                        "bTGyr": {
                            "name": "Test GET call",
                            "url": "https://jsonplaceholder.typicode.com/todos/1",
                            "rank": 0,
                            "types": "{\"bTGyn.bTGyr\":{\"caption\":\"API Call\",\"fields\":{\"_api_c2_userId\":{\"ret_value\":\"number\",\"caption\":\"userId\",\"sample_value\":1,\"path\":[\"userId\"]},\"_api_c2_id\":{\"ret_value\":\"text\",\"caption\":\"id\",\"sample_value\":1,\"path\":[\"id\"]},\"_api_c2_title\":{\"ret_value\":\"text\",\"caption\":\"title\",\"sample_value\":\"delectus aut autem\",\"path\":[\"title\"]},\"_api_c2_completed\":{\"ret_value\":\"boolean\",\"caption\":\"completed\",\"sample_value\":false,\"path\":[\"completed\"]}}}}",
                            "method": "get",
                            "ret_value": "api.apiconnector2.bTGyn.bTGyr",
                            "publish_as": "data",
                            "initialized": true,
                            "should_reinitialize": true,
                            "url_cant_be_private": true
                        }
                    },
                    "human": "Test API"
                }
            },
```

The 'types' object contains the JSON schema for the GET request response and how Bubble has parsed it, which if we unescape and lint looks like this below. 

```JSON
{
  "bTGyn.bTGyr": {
    "caption": "API Call",
    "fields": {
      "_api_c2_userId": {
        "ret_value": "number",
        "caption": "userId",
        "sample_value": 1,
        "path": [
          "userId"
        ]
      },
      "_api_c2_id": {
        "ret_value": "text",
        "caption": "id",
        "sample_value": 1,
        "path": [
          "id"
        ]
      },
      "_api_c2_title": {
        "ret_value": "text",
        "caption": "title",
        "sample_value": "delectus aut autem",
        "path": [
          "title"
        ]
      },
      "_api_c2_completed": {
        "ret_value": "boolean",
        "caption": "completed",
        "sample_value": false,
        "path": [
          "completed"
        ]
      }
    }
  }
}
```

What will be interested is to see how the above parsed data from the GET request response is used within the editor, for example in a conditional expression or as a data source. This will be the next test.