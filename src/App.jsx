import Background from './components/Background';
import ProductTable from './components/ProductTable';
import SearchBox from './components/SearchBox';
import { ProductDatasProvider } from './store/ProductDatasContext';

function App() {
  return (
    <ProductDatasProvider>
      <Background>
        <SearchBox />
        <ProductTable />
      </Background>
    </ProductDatasProvider>
  );
}

export default App;
