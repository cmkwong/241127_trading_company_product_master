import Background from './components/Background';
import OptionRow from './components/OptionRow';
import ProductTable from './components/ProductTable';
import SearchBox from './components/SearchBox';

// import styles from './App.module.css';
// import Button from './components/Button';

function App() {
  return (
    <Background>
      <SearchBox></SearchBox>
      <ProductTable></ProductTable>
    </Background>
  );
}

export default App;
