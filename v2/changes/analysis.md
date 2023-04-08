New elements are added in the 'elements' object of the page object. Those elements receive ids. The opening id of the element doesn't appear to be referenced elsewhere, but the value "id" within that object is used whenever it's referenced as a parent of a child element or being attached to a workflow. 

"bTGyg": {
        "properties": {
            "text": {
                "entries": {
                    "0": "Write to Bubble"
                },
                "type": "TextExpression"
            },
            "height": 45,
            "left": 186,
            "top": 285,
            "width": 150,
            "zindex": 3,
            "order": 2,
            "fit_height": true,
            "single_width": true,
            "min_width_css": "150px",
            "single_height": false,
            "min_height_css": "45px",
            "horiz_alignment": "flex-start"
        },
        "type": "Button",
        "id": "bTGyb",
        "default_name": "Button A",
        "style": "Button_primary_button_"
    }

The initial opening ID is however used in the id_to_path section of the JSON, indicating it's position in the elements tree, for example : 

 "bTGyb": "%p3.bTGbC.%el.bTGyg",

 We can see that the opening id of the element is being mapped to the inner ids of the page and the inner id of the element itself.

 Workflows can be analysed in several parts. First, the top level "type" value before the "actions" object shows us the 'Button is clicked' main workflow editor representation, which in the JSON is "ButtonClicked". Then in the "actions" object we find another "type" value "NewThing" which is Bubble's name for the workflow action "Create a new thing..." 
 
 The button the workflow is attached to is found in the upper "properties" object under "element_id". In the "initial_values" object we find the field "text" we added for the data we're creating in the "Message" table. The field is shown in "key" under the object "0" as "text_text" which likely is the field name and data type strung together with an underscore. 
 
 A mysterious object is the "next" object, which must be telling the action which data table to target with "type": "Message" but I can't tell what "name": "get_data" might mean. This must have something to do with the fact that the data being called in the Create field is a dynamic expression. We can see this in object "0" as this object's "type" is "TextExpression" which may mean dynamic expression expressing as a text. The element being targetted in the dynamic expression 'Input A's value' is in the "properties" object of object "0" as the key pair "element_id": "bTGyY" which is the inner element id of the input field A. 
 
 At the end of object "0"'s properties, we see "thing_type": "custom.message". This is definitely the method by which Bubble identifies data tables, as custom is a user created table (as opposed to the User table for example) and the original name of the table given at its creation is represented in lower case after the dot. Why this data type is represented twice in object "0" I'm not sure yet.

 "workflows": {
    "bTGym": {
        "properties": {
            "element_id": "bTGyb"
        },
        "type": "ButtonClicked",
        "id": "bTGyh",
        "actions": {
            "0": {
                "properties": {
                    "initial_values": {
                        "0": {
                            "key": "text_text",
                            "value": {
                                "entries": {
                                    "0": {
                                        "next": {
                                            "type": "Message",
                                            "name": "get_data"
                                        },
                                        "properties": {
                                            "element_id": "bTGyY"
                                        },
                                        "type": "GetElement"
                                    }
                                },
                                "type": "TextExpression"
                            },
                            "action": {
                                "type": "Empty"
                            }
                        }
                    },
                    "thing_type": "custom.message"
                },
                "type": "NewThing",
                "id": "bTGyk"
            }
        }
    },
    "length": 0


    To better understand, we could compare to the 'Reset password' workflow from v1. Here there are two inputs being targetted using dynamic expressions. The workflow action has only two required fields built into the action, quite different in key name ("new_password" and "new_password_again") to the above custom field represented by "initial_values". 
    
    We see the same "next" object that contains the "get_data" value which must be representative of the use of a dynamic expression. The corresponding values "GetElement" and "element_id": "BTGyp0" are telling the dynamic expression where to go to find its data. 
    
    Since the key "type" under "next" is again "Message" and this reset_pw page had no mention of the data table Message I created, I can conclude that this "Message" value is not related to a data table, but rather something again to do with the dynamic expression. This means the data table being targetted in the 'Create a thing..." workflow action above is indeed contained in the key "thing_type": "custom.message".

    {
"0": {
    "properties": {
        "new_password": {
            "entries": {
                "0": {
                    "next": {
                        "type": "Message",
                        "name": "get_data"
                    },
                    "properties": {
                        "element_id": "bTGyp0"
                    },
                    "type": "GetElement"
                }
            },
            "type": "TextExpression"
        },
        "new_password_again": {
            "entries": {
                "0": {
                    "next": {
                        "type": "Message",
                        "name": "get_data"
                    },
                    "properties": {
                        "element_id": "bTGyj0"
                    },
                    "type": "GetElement"
                }
            },
            "type": "TextExpression"
        }
    },
    "type": "ResetPassword",
    "id": "bTGyX"
}
}

Changing the page properties revealed a couple of things about how the new responsive engine CSS values are expressed. The page being in new responsive or not is shown in "new_responsive": true. The type of group container is expressed as "container_layout": "column". Automatic row gaps between elements in a column container are simply represented by "row_gap": 20. We also see how Bubble pages are identified and stored, as "type": "Page" and "id": "bTGYf" and "name": "index".

One mysterious value to explore is "element_versin": 3. Another is why all Bubble elements seem to contain "left" and "top" numbers, as if these were some kind of CSS spacing but missing the bottom and right values.

{
"properties": {
                "height": 767,
                "left": 0,
                "top": 0,
                "width": 1080,
                "title": {
                    "entries": {
                        "0": "Bubble | No-code apps"
                    },
                    "type": "TextExpression"
                },
                "repeat_background_horizontal": true,
                "repeat_background_vertical": true,
                "row_gap": 20,
                "use_gap": true,
                "min_width_px": 0,
                "preset_width": "custom",
                "default_width": 1080,
                "min_height_px": 767,
                "new_responsive": true,
                "element_version": 3,
                "backdrop_bgcolor": "rgba(255, 255, 255, 1)",
                "container_layout": "column",
                "backdrop_background_style": "bgcolor"
            },
            "type": "Page",
            "id": "bTGYf",
            "name": "index"
        }