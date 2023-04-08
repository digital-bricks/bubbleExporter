When adding a conditoin to an element, it appears in a value called 'states'. 

We see once again the key 'next' which seems to indicate a dynamic expression. I wonder if next is indicative of the left to right expression construction in Bubble. Perhaps in the next iteration we can try a long dynamic expression in a new condition to test this theory. 

There's the "type": "GetElement" key pair which makes the dynamic expression target a specific element for the "get_data" part of the expression.

"states": {
        "0": {
            "condition": {
                "next": {
                    "next": {
                        "type": "Message",
                        "name": "is_empty"
                    },
                    "type": "Message",
                    "name": "get_data"
                },
                "properties": {
                    "element_id": "bTGyY"
                },
                "type": "GetElement"
            },
            "properties": {
                "is_visible": false
            },
            "type": "State"
        }
    },