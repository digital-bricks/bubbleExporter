Here we see a larger example of a dynamic Bubble expression. It is essentially three different evaluators strung together with an AND and an OR operator. The construction of the JSON is complicated, so I asked Github Copilot (chatGPT) to help me make sense of it:

The first evaluator checks if the current user is logged in. The second evaluator checks if the current user is logged in and if the element with the ID bTGyY contains the text "test1". The third evaluator checks if the current user is logged in and if the URL parameter "test_url_parameter" is equal to "test2".

The final evaluator is the combination of the first two evaluators. It checks if the current user is logged in and if the element with the ID bTGyY contains the text "test1" or if the current user is logged in and if the URL parameter "test_url_parameter" is equal to "test2".

ChatGPT cleaned up condition JSON:

```JSON
{
    "type": "Message",
    "name": "and_",
    "args": {
        "next": {
            "type": "Message",
            "name": "or_",
            "args": {
                "next": {
                    "type": "Message",
                    "name": "and_",
                    "args": {
                        "next": {
                            "type": "Message",
                            "name": "contains",
                            "args": {
                                "next": {
                                    "type": "Message",
                                    "name": "get_data",
                                    "args": "test1"
                                },
                                "properties": {
                                    "element_id": "bTGyY"
                                },
                                "type": "GetElement"
                            }
                        },
                        "type": "Message",
                        "name": "logged_in"
                    }
                },
                "type": "Message",
                "name": "equals",
                "args": {
                    "next": {
                        "type": "Message",
                        "name": "get_data",
                        "args": "test2"
                    },
                    "properties": {
                        "parameter_name": {
                            "type": "TextExpression",
                            "entries": {
                                "0": "test_url_parameter"
                            }
                        }
                    },
                    "type": "GetParamFromUrl"
                }
            }
        },
        "type": "Message",
        "name": "logged_in"
    }
}
```