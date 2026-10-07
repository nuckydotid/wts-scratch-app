# React Legacy APIs & Migration Reference

Reference guide for legacy React APIs maintained for backwards compatibility.

---

## Catalog

### 1. `Children` (`Children.map`, `Children.forEach`, `Children.count`)

- Legacy utility for manipulating `props.children`.
- **Modern Alternative**: Pass arrays of items or custom render props.

### 2. `cloneElement`

- Clones a React element and attaches new props.
- **Modern Alternative**: Pass props down explicitly, use context, or use render props (`renderItem={({ active }) => ...}`).

### 3. `Component` & `PureComponent` (Class Components)

- Class-based component declarations with `render()` and lifecycle methods (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`).
- **Modern Alternative**: Function components with `useState`, `useEffect`, and `memo`.

### 4. `createRef`

- Creates a ref object in class components.
- **Modern Alternative**: `useRef`.

### 5. `createElement` & `isValidElement`

- Low-level JSX transformation targets (`React.createElement('div', props, ...children)`).
