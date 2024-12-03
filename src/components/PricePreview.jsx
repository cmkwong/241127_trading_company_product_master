import zoomIcon from '../assets/zoom.svg';
import { useState } from 'react';
import styles from './PricePreview.module.css';

import { makeComplexId } from '../utils/string';
import PriceUpdate from './PriceUpdate';

const PricePreviewRow = (props) => {
  let { data } = props;

  return (
    <div className={styles.datarow}>
      <div>
        <img src={data.img} alt="picture" />
      </div>
      <div>
        <p>{data.varient.join(' / ')}</p>
      </div>
      <div>
        <p>{`${data.currency} ${data.price}`}</p>
      </div>
      <div>
        <a href={data.link}>{data.supplier}</a>
      </div>
    </div>
  );
};

const PricePreview = () => {
  let datas = [
    {
      varient_sequence: ['lock', 'color'],
      varient: ['front', 'red'],
      currency: 'HKD',
      img: '',
      price: 125,
      stock: 4281,
      supplier: 'Sink Lin Trading Company',
      link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
    },
    {
      varient_sequence: ['lock', 'color'],
      varient: ['front', 'yellow'],
      currency: 'HKD',
      img: '',
      price: 125,
      stock: 4281,
      supplier: 'Sink Lin Trading Company',
      link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
    },
    {
      varient_sequence: ['lock', 'color'],
      varient: ['front', 'blue'],
      currency: 'HKD',
      img: '',
      price: 125,
      stock: 4281,
      supplier: 'Sink Lin Trading Company',
      link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
    },
    {
      varient_sequence: ['lock', 'color'],
      varient: ['back', 'red'],
      currency: 'HKD',
      img: '',
      price: 125,
      stock: 4281,
      supplier: 'Sink Lin Trading Company',
      link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
    },
    {
      varient_sequence: ['lock', 'color'],
      varient: ['back', 'yellow'],
      currency: 'HKD',
      img: '',
      price: 125,
      stock: 4281,
      supplier: 'Sink Lin Trading Company',
      link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
    },
    {
      varient_sequence: ['lock', 'color'],
      varient: ['back', 'blue'],
      currency: 'HKD',
      img: '',
      price: 125,
      stock: 4281,
      supplier: 'Sink Lin Trading Company',
      link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
    },
  ];

  const [popWindow, setPopWindow] = useState(false);
  const [varientData, setVarientData] = useState(datas);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <p></p>
          <p>Varient</p>
          <p>Price</p>
          <p>Supplier</p>
        </div>
        {varientData.map((data) => (
          <PricePreviewRow key={makeComplexId(8)} data={data} />
        ))}
        <img
          onClick={() => setPopWindow(true)}
          className={styles.zoom}
          src={zoomIcon}
          alt="Zoom"
        />
      </div>
      {popWindow && <PriceUpdate datas={datas} setPopWindow={setPopWindow} />}
    </div>
  );
};

export default PricePreview;
