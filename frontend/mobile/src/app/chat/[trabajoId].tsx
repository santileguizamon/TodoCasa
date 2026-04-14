import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  obtenerChatPorTrabajo,
  obtenerMensajes,
  enviarMensaje,
} from '../../api/chat.api'
import {
  obtenerTrabajo,
  finalizarTrabajo,
  definirFechaAcordada,
} from '../../api/trabajos.api'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/auth-context'
import { marcarChatLeido } from '../../api/chat.api'
import { socket } from '../../lib/socket'
import { chatScreenStyles as styles } from '../../styles/chat-screen.styles'

export default function ChatScreen() {
  const { trabajoId } = useLocalSearchParams<{ trabajoId: string }>()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()

  const [chat, setChat] = useState<any>(null)
  const [trabajo, setTrabajo] = useState<any>(null)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const [puedeValorarTrabajo, setPuedeValorarTrabajo] = useState(false)

  const [mostrarFechaModal, setMostrarFechaModal] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date())
  const [guardandoFecha, setGuardandoFecha] = useState(false)
  const [mostrarPicker, setMostrarPicker] = useState(false)

  const flatListRef = useRef<FlatList>(null)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    async function cargarChat() {
      try {
        setLoading(true)

        const chatData = await obtenerChatPorTrabajo(Number(trabajoId))
        setChat(chatData)

        await marcarChatLeido(chatData.id)

        const mensajesData = await obtenerMensajes(chatData.id)
        setMensajes(mensajesData)

        const trabajoRes = await obtenerTrabajo(Number(trabajoId))
        setTrabajo(trabajoRes)

        if (user?.rol === 'CLIENTE') {
          const puede = await apiFetch<{
            puedeValorar: boolean
          }>(`/trabajos/${Number(trabajoId)}/puede-valorar`)
          setPuedeValorarTrabajo(Boolean(puede?.puedeValorar))
        }
      } finally {
        setLoading(false)
      }
    }

    cargarChat()
  }, [trabajoId])

  useEffect(() => {
    if (mostrarFechaModal) {
      setMostrarPicker(true)
    }
  }, [mostrarFechaModal])

  useEffect(() => {
    if (!chat?.id) return

    socketRef.current = socket

    socketRef.current.emit('unirseChat', {
      chatId: chat.id,
    })

    socketRef.current.on('nuevoMensaje', (mensaje: any) => {
      setMensajes((prev) => [...prev, mensaje])

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })

    return () => {
      socketRef.current?.off('nuevoMensaje')
    }
  }, [chat?.id])

  async function handleEnviar() {
    if (!texto.trim() || sending || trabajo?.estado === 'FINALIZADO') return

    try {
      setSending(true)
      socketRef.current.emit('enviarMensaje', {
        chatId: chat.id,
        remitenteId: user?.id,
        contenido: texto.trim(),
      })

      setTexto('')

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        })
      }, 100)
    } finally {
      setSending(false)
    }
  }

  async function handleGuardarFecha() {
    if (!trabajo || !chat) return

    try {
      setGuardandoFecha(true)

      await definirFechaAcordada(trabajo.id, fechaSeleccionada)

      const fechaFormateada = fechaSeleccionada.toLocaleDateString()

      await enviarMensaje(
        chat.id,
        `Fecha del trabajo acordada para el ${fechaFormateada}`
      )

      const [mensajesData, trabajoRes] = await Promise.all([
        obtenerMensajes(chat.id),
        obtenerTrabajo(trabajo.id),
      ])

      setMensajes(mensajesData)
      setTrabajo(trabajoRes)

      setMostrarFechaModal(false)
    } catch {
      Alert.alert('Error', 'No se pudo guardar la fecha')
    } finally {
      setGuardandoFecha(false)
    }
  }

  function handleFinalizarTrabajo() {
    if (finalizando) return

    Alert.alert('Finalizar trabajo', 'Confirmas que el trabajo ya fue realizado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: async () => {
          try {
            setFinalizando(true)
            await finalizarTrabajo(trabajo.id)

            Alert.alert('Trabajo finalizado', 'Ahora podes valorar al profesional')

            const trabajoRes = await obtenerTrabajo(trabajo.id)
            setTrabajo(trabajoRes)
            setPuedeValorarTrabajo(trabajoRes?.estado === 'FINALIZADO')
          } catch {
            Alert.alert('Error', 'No se pudo finalizar el trabajo')
          } finally {
            setFinalizando(false)
          }
        },
      },
    ])
  }

  if (loading) {
    return <ActivityIndicator style={styles.loader} />
  }

  if (!chat) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <Text>No se pudo cargar el chat</Text>
      </View>
    )
  }

  const esCliente = user?.rol === 'CLIENTE'

  const puedeFinalizar =
    esCliente &&
    (trabajo?.estado === 'ASIGNADO' || trabajo?.estado === 'PENDIENTE_CONFIRMACION')

  const trabajoFinalizado = trabajo?.estado === 'FINALIZADO'

  const puedeValorar = esCliente && trabajoFinalizado && puedeValorarTrabajo

  const puedeDefinirFecha = esCliente && trabajo?.estado === 'ASIGNADO' && !trabajo?.fechaAcordada

  const nombreOtro = esCliente
    ? chat?.profesional?.nombre || 'Profesional'
    : chat?.cliente?.nombre || 'Cliente'
  const rolOtro = esCliente ? 'Profesional' : 'Cliente'

  function renderMensaje(item: any) {
    const esMio = item.remitenteId === user?.id

    return (
      <View
        style={[
          styles.messageBubble,
          esMio ? styles.messageMine : styles.messageOther,
        ]}
      >
        <Text style={esMio ? styles.messageTextMine : styles.messageTextOther}>
          {item.contenido}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top + 8, 16), paddingBottom: insets.bottom + 10 },
        ]}
      >
        <View style={styles.topHeader}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {nombreOtro.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{nombreOtro}</Text>
            <Text style={styles.headerRole}>{rolOtro}</Text>
          </View>
        </View>

        {trabajo?.fechaAcordada && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>
              Fecha acordada: {new Date(trabajo.fechaAcordada).toLocaleDateString()}
            </Text>
          </View>
        )}

        {puedeDefinirFecha && (
          <Pressable
            onPress={() => setMostrarFechaModal(true)}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Definir fecha del trabajo</Text>
          </Pressable>
        )}

        {trabajoFinalizado && (
          <View style={styles.successCard}>
            <Text style={styles.successText}>Trabajo finalizado</Text>

            {puedeValorar && (
              <Pressable
                onPress={() =>
                  router.push(
                    `/(protected)/cliente/trabajo/${trabajo.id}` as any
                  )
                }
                style={styles.warningButton}
              >
                <Text style={styles.warningButtonText}>Valorar profesional</Text>
              </Pressable>
            )}
          </View>
        )}

        {puedeFinalizar && (
          <View style={styles.neutralCard}>
            <Pressable
              onPress={handleFinalizarTrabajo}
              disabled={finalizando}
              style={styles.successButton}
            >
              <Text style={styles.successButtonText}>Finalizar trabajo</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          style={styles.list}
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderMensaje(item)}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({
              animated: true,
            })
          }
        />

        {!trabajoFinalizado ? (
          <View style={styles.inputRow}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribi un mensaje..."
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <Pressable
              onPress={handleEnviar}
              disabled={sending}
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            >
              <Text style={styles.sendButtonText}>Enviar</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.closedText}>
            El trabajo fue finalizado. El chat esta cerrado.
          </Text>
        )}
      </View>

      <Modal
        visible={mostrarFechaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarFechaModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMostrarFechaModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Selecciona la fecha del trabajo</Text>

                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={fechaSeleccionada}
                    mode="date"
                    display="inline"
                    onChange={(_, date) => {
                      if (date) setFechaSeleccionada(date)
                    }}
                  />
                ) : (
                  <>
                    {mostrarPicker ? (
                      <DateTimePicker
                        value={fechaSeleccionada}
                        mode="date"
                        display="calendar"
                        onChange={(event, date) => {
                          if (event.type === 'set' && date) {
                            setFechaSeleccionada(date)
                            setMostrarPicker(false)
                            return
                          }
                          if (event.type === 'dismissed') {
                            setMostrarPicker(false)
                          }
                        }}
                      />
                    ) : (
                      <View style={styles.dateSummary}>
                        <Text style={styles.dateSummaryLabel}>Fecha seleccionada</Text>
                        <Text style={styles.dateSummaryValue}>
                          {fechaSeleccionada.toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    <Pressable
                      onPress={() => setMostrarPicker(true)}
                      style={styles.changeDateButton}
                    >
                      <Text style={styles.changeDateButtonText}>Cambiar fecha</Text>
                    </Pressable>
                  </>
                )}

                <Pressable
                  onPress={handleGuardarFecha}
                  disabled={guardandoFecha}
                  style={styles.modalPrimaryButton}
                >
                  <Text style={styles.modalPrimaryText}>Guardar fecha</Text>
                </Pressable>

                <Pressable
                  onPress={() => setMostrarFechaModal(false)}
                  style={styles.modalSecondaryButton}
                >
                  <Text style={styles.modalSecondaryText}>Cancelar</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  )
}
