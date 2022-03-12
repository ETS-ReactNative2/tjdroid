import React, { useEffect, useState } from "react";
import { useIsFocused } from '@react-navigation/native';
import { Alert, ToastAndroid } from "react-native";
import { BorderlessButton, FlatList, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { buscarAsyncStorageTjDroidIdioma } from "../../utils/utils";

import moment from "moment";
import "moment/locale/pt";

import Header from "../../components/Header";
import DialogModal from "../../components/DialogModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyMessage from "../../components/EmptyMessage";

import {
  buscarResidenciasVisitas,
  editarNomeCasa,
  excluirVisitaCasa
} from "../../controllers/territoriosController";

import {
  Container,
  ItemList,
  ItemListDay,
  ItemListTextDay,
  ItemListTextDayInfo,
  ItemListTextLastVisit,
  HeaderBoxPersonName,
  HeaderPersonName,
  HeaderPersonNameIcon,
} from "./styles";

export default function TerritorioResidenciasVisitas({route, navigation}) {

  const { t } = useTranslation();
  const isFocused = useIsFocused();

  // Estado local para setar o idioma nos locais
  const [appLanguageLocal, setAppLanguageLocal] = useState("");

  // Dialog states
  const [reload, setReload] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [allVisitasResidencia, setAllVisitasResidencia] = useState({});
  const [carregando, setCarregando] = useState(true);
  
  useEffect(() => {

    // Pega o ID via props da rota
    const { residenciaId, territoryId } = route.params;

    // Mostra a mensagem de carregando
    setCarregando(true);
    
    // Estado que mostra se ainda é para continuar buscando os dados da tela
    let continuarBuscarDados = true;

    // Se o aplicativo estiver com o foco nessa tela, faz isso
    if (isFocused) {

      const buscarDados = async () => {

        if (continuarBuscarDados) {

          // Busca os anos de Servico no Controller para setar no SectionList
          await buscarResidenciasVisitas(residenciaId, territoryId)
          .then((dados) => {

            // Trata o retorno
            if(dados) {

              // Seta o estado com todos as visitas da pessoa para o SectionList
              setAllVisitasResidencia(dados);

              // Retira a mensagem de carregando
              // setCarregando(false);
              
            } else {
              
              // Retira a mensagem de carregando
              // setCarregando(false);

              // Se der errado, dispara o toast
              ToastAndroid.show(t("screens.territorioresidenciasvisitas.visits_load_message_error"), ToastAndroid.LONG);
            }
          })  
          .catch((error) => {
            // Se der errado, dispara o toast
            ToastAndroid.show(t("screens.territorioresidenciasvisitas.visits_load_message_error"), ToastAndroid.LONG);
          });
        }
      }
      buscarDados();
    }

    // Função para pegar o idioma do app
    const getAppLanguage = async () => {
      // Busca o idioma salvo no AsyncStorage
      setAppLanguageLocal(await buscarAsyncStorageTjDroidIdioma());
      setCarregando(false);
    }
    getAppLanguage();
    
    // Quando sair da tela, para de buscar
    return () => {
      continuarBuscarDados = false;
      setAppLanguageLocal("");
    };
  }, [isFocused, reload]);

  // Abrir dialod do nome
  function handleOpenDialog(showDialogBoolean) {
    setDialogVisible(showDialogBoolean);
  }

  // Fechar dialod do nome
  function handleCancelDialog(){
    setDialogVisible(false);
  }
  
  // Seta o novo nome da tela
  function handleChangeHomeIdentifier(newIdentifier){
    setAllVisitasResidencia({...allVisitasResidencia, nome: newIdentifier});
  }

  // ALERTA de DELETAR VISITA
  const alertaDeletarVisitaCasa = ({idVisita, residenciaId, territorioId}) =>
  Alert.alert(
    t("screens.territorioresidenciasvisitas.alert_visit_deleted_title"),
    t("screens.territorioresidenciasvisitas.alert_visit_deleted_message"),
    [
      {
        text: t("words.no"),
        onPress: () => {},
        style: "cancel"
      },
      { text: t("words.yes"), onPress: () => handleDeletarVisita(idVisita, residenciaId, territorioId)}
    ],
    { cancelable: true }
  );
    
  // EDITAR NOME CASA
  function handleChangeHomeName(casaNome, residenciaId, territorioId) {
    editarNomeCasa(casaNome, residenciaId, territorioId)
    .then((dados) => {
      
      // Trata o retorno
      if (dados) {
        // Mensagem Toast
        ToastAndroid.show(t("screens.territorioresidenciasvisitas.house_change_name_message_success"), ToastAndroid.SHORT);

        // Oculta o dialogModal
        setDialogVisible(false);

        // Altera o nome no objeto no estado atual
        setAllVisitasResidencia({...allVisitasResidencia, nomeMorador: casaNome});
        
      } else {
        // Se der errado, dispara o toast
        ToastAndroid.show(t("screens.territorioresidenciasvisitas.house_change_name_message_error"), ToastAndroid.LONG);
      }
    })
    .catch((e) => {
      // Se der errado, dispara o toast
      ToastAndroid.show(t("screens.territorioresidenciasvisitas.house_change_name_message_error"), ToastAndroid.LONG);
    })
  }

  // DELETAR VISITA PESSOA
  function handleDeletarVisita(idVisita, residenciaId, territorioId) {
    excluirVisitaCasa(idVisita, residenciaId, territorioId)
    .then((dados) => {
      
      // Trata o retorno
      if (dados) {
        // Mensagem Toast
        ToastAndroid.show(t("screens.territorioresidenciasvisitas.visit_deleted_message_success"), ToastAndroid.SHORT);
        // Faz reaload da página
        setReload(!reload);
        
      } else {
        // Se der errado, dispara o toast
        ToastAndroid.show(t("screens.territorioresidenciasvisitas.visit_deleted_message_error"), ToastAndroid.LONG);
      }
    })
    .catch((e) => {
      ToastAndroid.show(t("screens.territorioresidenciasvisitas.visit_deleted_message_error"), ToastAndroid.LONG);
    })
  }

  const Item = ({ item }) => (
    <TouchableWithoutFeedback 
      onPress={() => navigation.navigate('TerritorioResidenciaEditarVisita', { 
        idVisita: item.id, 
        residenciaId: allVisitasResidencia.id, 
        territorioId: allVisitasResidencia.territorioId })}
      onLongPress={() => alertaDeletarVisitaCasa({ 
        idVisita: item.id, 
        residenciaId: allVisitasResidencia.id, 
        territorioId: allVisitasResidencia.territorioId })}
    >
      <ItemList>
        <ItemListDay>
          <ItemListTextDay tail numberOfLines={1} >{moment(item.data).format('L')}</ItemListTextDay>
          <ItemListTextDayInfo tail numberOfLines={1} >{moment(item.data).locale(appLanguageLocal?.language).format('dddd, HH:mm')}</ItemListTextDayInfo>
        </ItemListDay>
        <ItemListTextLastVisit bgColor={item.visitaBgColor} fontColor={item.visitaFontColor} >{item.visita}</ItemListTextLastVisit>
      </ItemList>
    </TouchableWithoutFeedback>
  );

  const EmptyListMessage = () => (
    <EmptyMessage 
      title={t("screens.territorioresidenciasvisitas.screen_empty_title")}
      message={t("screens.territorioresidenciasvisitas.screen_empty_message")}
      />
  );

  return (
    <Container>

      <Header 
        title={allVisitasResidencia.nome} 
        showGoBack 
        showDeleteTerritoryHome={{
          residenciaId: allVisitasResidencia.id, 
          territoryId: allVisitasResidencia.territorioId}} 
        showAddHomeVisit={{
          residenciaId: allVisitasResidencia.id, 
          territoryId: allVisitasResidencia.territorioId}}
        showEditHomeIdentifier={{
          residenciaId: allVisitasResidencia.id, 
          territoryId: allVisitasResidencia.territorioId}}
        territoryData={{
          nome: allVisitasResidencia.nome,
          residenciaId: allVisitasResidencia.id, 
          territoryId: allVisitasResidencia.territorioId}}
        handleChangeHomeIdentifierFunc={(r) => handleChangeHomeIdentifier(r)}
      />

      <DialogModal 
        dialogVisibleProp={dialogVisible}
        dialogValue={`${allVisitasResidencia.nomeMorador}`}
        dialogTitle={t("screens.territorioresidenciasvisitas.dialog_change_name_household_title")} 
        dialogMessage={t("screens.territorioresidenciasvisitas.dialog_change_name_household_message")} 
        dialogFunction={(residenciaNome) => handleChangeHomeName(residenciaNome, allVisitasResidencia.id, allVisitasResidencia.territorioId)} 
        dialogCloseFunction={() => handleCancelDialog()} 
      />

      <HeaderBoxPersonName>
        <HeaderPersonName>
          {allVisitasResidencia.nomeMorador}
        </HeaderPersonName>
        <BorderlessButton onPress={() => handleOpenDialog(true)}>
          <HeaderPersonNameIcon name="edit-2" size={22} />
        </BorderlessButton>
      </HeaderBoxPersonName>
      
      {carregando 
      ? (<LoadingSpinner />)
      : (<FlatList
          style={{ width: "100%", paddingBottom: 150}}
          data={allVisitasResidencia.visitas}
          renderItem={Item}
          ListEmptyComponent={EmptyListMessage}
          keyExtractor={(item) => item.id.toString()}
        />)
      }
      
    </Container>
  )
}
