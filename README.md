# inline-svg-template

CLI tool that should lay foundation for https://github.com/okcoker/grunt-svg-react-component

This allows for custom templates and parsing.


#### Usage

```sh
# -i Input
# -t Template file
# -c Clean directory
# -o Output directory
# -e Extension of output files
# -s Optimize with SVGO

ist -i "public/images/icons/**/*.svg" -t example-template/react-class.js -c true -o shared/components/icons -e .js -s true
```

#### Including in your React files

If your React components are flavored with ES6, you might include your freshly converted icon like so:

```js

import React, { Component } from 'react';
import ConvertedIcon from './path/to/converted/svg/component/icon';

class SomeComponent extends Component {
    render() {
        <button>
            <ConvertedIcon className="icon" />
            Click me
        </button>
    }
}

```
