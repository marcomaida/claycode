# Claycode Common Library

This library provides shared functionality for both the scanner and generator components of the Claycode webapp. It eliminates code duplication and ensures consistent behavior across different parts of the application.

## Components

### Tree Components
- `Tree`: Represents a tree data structure
- `TreeNode`: Represents a node in a tree
- `TopologyAnalyzer`: Analyzes tree structures for Claycode patterns

### Bit Components
- `BitString`: Represents a string of bits
- `BitTreeConverter`: Converts between trees and bit strings
- `BitsValidator`: Validates bit strings using CRC
- `TextBitsConverter`: Converts between text and bit strings

### Utility Components
- `FpsCounter`: Measures frames per second for performance monitoring

## Usage

Import components from the common library:

```javascript
import { 
    Tree, 
    TreeNode, 
    TopologyAnalyzer,
    BitString,
    BitTreeConverter,
    BitsValidator,
    TextBitsConverter,
    FpsCounter
} from '../common/index.js';
```

## License

Copyright (c) 2025 Claycode
Licensed under the MIT License with the Commons Clause.
Commercial use is prohibited without a separate license.
See LICENSE in the project root for details.
SPDX-License-Identifier: MIT AND Commons-Clause