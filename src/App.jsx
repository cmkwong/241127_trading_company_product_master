import Background from './components/Background';
import MediaUpload from './components/MediaUpload';
import OptionRow from './components/OptionRow';
import PricePreview from './components/PricePreview';
import ProductTable from './components/ProductTable';
import SearchBox from './components/SearchBox';

// import styles from './App.module.css';
// import Button from './components/Button';

function App() {
  return (
    <Background>
      <SearchBox />
      <ProductTable />
    </Background>
  );
}

export default App;
