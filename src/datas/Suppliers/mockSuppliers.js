export const mockSuppliers = [
  {
    code: 'S000215',
    companyName: '东莞市长安永诚镭射雕刻',
    service: [1, 2],
    links: [
      { id: 1, link: 'www.google.com', type: 1 },
      { id: 2, link: 'www.yahoo.com', type: 2 },
    ],
    contact: [
      { id: 1, type: 2, value: '18641209029' },
      { id: 2, type: 1, value: '81252525' },
    ],
    address: [
      {
        id: 1,
        type: 1,
        value:
          '东莞市恒昌高分子材料有限公司位于东莞市常平镇常东路137号凯瑞丰工业园',
      },
    ],
    remark: [{ id: 1, value: 'testing remark', date: '2025-10-27' }],
  },
];
