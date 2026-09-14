import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sub_DocumentNode from './Sub_DocumentNode';
import { buildDocumentFlowGraph } from './utils/documentFlowGraph';
import { useSalesQuotationContext } from '../../../store/SalesQuotationContext';
import { useMasterContext } from '../../../store/MasterContext';
import styles from './Main_DocumentFlow.module.css';

const nodeTypes = { document: Sub_DocumentNode };

const Main_DocumentFlow = ({
  purchaseCosts,
  baseCurrencyCode,
  exchangeRateMap,
  currencyCodeById = {},
}) => {
  const { quotations, productOptions, serviceOptions, selectSalesQuotation } =
    useSalesQuotationContext();
  const { docType } = useMasterContext();
  const navigate = useNavigate();

  const { nodes: builtNodes, edges: builtEdges } = useMemo(
    () =>
      buildDocumentFlowGraph({
        quotations,
        purchaseCosts,
        docType,
        productOptions,
        serviceOptions,
        baseCurrencyCode,
        exchangeRateMap,
        currencyCodeById,
      }),
    [
      quotations,
      purchaseCosts,
      docType,
      productOptions,
      serviceOptions,
      baseCurrencyCode,
      exchangeRateMap,
      currencyCodeById,
    ],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  useEffect(() => {
    setNodes(builtNodes);
    setEdges(builtEdges);
  }, [builtNodes, builtEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_, node) => {
      const id = String(node?.id || '');
      if (id.startsWith('sales:')) {
        const docId = id.slice('sales:'.length);
        selectSalesQuotation(docId);
        navigate(`/panel/sales/${docId}`);
      } else if (id.startsWith('pr:')) {
        const prId = id.slice('pr:'.length);
        navigate(`/panel/purchase/${prId}`);
      }
    },
    [selectSalesQuotation, navigate],
  );

  return (
    <div className={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.2}
        onNodeClick={handleNodeClick}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Main_DocumentFlow;
