import React from 'react'
import Contador from '../../components/Contador'

import moment from "moment";
import "moment/locale/pt-br";

export default function RelatorioDetalhes({route}) {

  const { anotacoes, colocacoes, data, id, minutos, revisitas, videosMostrados }  = route.params;

  return (
    <>
      <Contador relatorioId={id} minutosProp={minutos} colocacoesProp={colocacoes} videosMostradosProp={videosMostrados} revisitasProp={revisitas} observacoesProp={anotacoes} diaProp={moment(data).format('L')} horaProp={moment(data).format('LT')} paginaRelatorioDetalhes />
    </>
  )
}
