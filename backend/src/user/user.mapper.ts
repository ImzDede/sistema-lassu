import { AvailabilityRow } from "../availability/availability.type";
import { UserProfileResponseDTO, UserCreateResponseDTO, UserCreateRow, UserFirstAccessResponseDTO, UserFirstAccessRow, UserListAllResponseDTO, UserListRow, UserLoginResponseDTO, UserLoginRow, UserMinRow, UserRow, UserUpdateProfileResponseDTO, UserUpdateProfileRow, UserUpdateResponseDTO, UserUpdateRow, UserGetResponseDTO, UserMinResponseDTO, AvailableUserRow, UserAvailableResponseDTO } from "./user.type";

export class UserMapper {
  static toMyProfileResponse(data: { userRow: UserRow }): UserProfileResponseDTO {
    const { userRow } = data
    return {
      user: {
        id: userRow.id,
        nome: userRow.nome,
        email: userRow.email,
        telefone: userRow.telefone,
        matricula: userRow.matricula,
        fotoUrl: userRow.foto_url,
        permAtendimento: userRow.perm_atendimento,
        permCadastro: userRow.perm_cadastro,
        permAdmin: userRow.perm_admin,
        ativo: userRow.ativo,
        primeiroAcesso: userRow.primeiro_acesso,
        createdAt: userRow.created_at
      }
    };
  }

  static toGetResponse(data: { userRow: UserRow, availabilityRows: AvailabilityRow[] }): UserGetResponseDTO {
    const { userRow, availabilityRows } = data
    return {
      user: {
        id: userRow.id,
        nome: userRow.nome,
        email: userRow.email,
        telefone: userRow.telefone,
        matricula: userRow.matricula,
        fotoUrl: userRow.foto_url,
        permAtendimento: userRow.perm_atendimento,
        permCadastro: userRow.perm_cadastro,
        permAdmin: userRow.perm_admin,
        ativo: userRow.ativo,
        primeiroAcesso: userRow.primeiro_acesso,
        createdAt: userRow.created_at
      },
      availability: availabilityRows.map((row) => {
        return {
          diaSemana: row.dia_semana,
          horaInicio: row.hora_inicio,
          horaFim: row.hora_fim
        }
      })
    };
  }

  static toCreate(data: { userRow: UserCreateRow }): UserCreateResponseDTO {
    const { userRow } = data
    return {
      user: {
        id: userRow.id,
        nome: userRow.nome,
        createdAt: userRow.created_at
      }
    }
  }

  static toLogin(data: { userRow: UserLoginRow, token: string }): UserLoginResponseDTO {
    const { userRow, token } = data
    return {
      token,
      user: {
        id: userRow.id,
        nome: userRow.nome,
        matricula: userRow.matricula
      }
    }
  }

  static toFirstAccess(data: { userRow: UserFirstAccessRow, token: string, availabilityRows: AvailabilityRow[] }): UserFirstAccessResponseDTO {
    const { userRow, token, availabilityRows } = data
    return {
      token,
      user: {
        id: userRow.id,
        nome: userRow.nome,
        fotoUrl: userRow.foto_url,
        primeiroAcesso: userRow.primeiro_acesso
      },
      availability: availabilityRows.map((row) => {
        return {
          diaSemana: row.dia_semana,
          horaInicio: row.hora_inicio,
          horaFim: row.hora_fim
        }
      })
    }
  }

  static toUpdateProfile(data: { userRow: UserUpdateProfileRow }): UserUpdateProfileResponseDTO {
    const { userRow } = data
    return {
      user: {
        id: userRow.id,
        nome: userRow.nome,
        email: userRow.email,
        telefone: userRow.telefone,
        fotoUrl: userRow.foto_url
      }
    }
  }

  static toUpdate(data: { userRow: UserUpdateRow }): UserUpdateResponseDTO {
    const { userRow } = data
    return {
      user: {
        id: userRow.id,
        nome: userRow.nome,
        matricula: userRow.matricula,
        permAtendimento: userRow.perm_atendimento,
        permCadastro: userRow.perm_cadastro,
        ativo: userRow.ativo
      }
    }
  }

  static toResetPassword(data: { userRow: UserMinRow }): UserMinResponseDTO {
    const { userRow } = data
    return {
      user: {
        id: userRow.id,
        nome: userRow.nome
      }
    }
  }

  static toAvailableUser(data: { userRows: AvailableUserRow[] }): UserAvailableResponseDTO[] {
    const { userRows } = data
    return userRows.map((userRow) => {
      return {
        user: {
          id: userRow.id,
          nome: userRow.nome,
          matricula: userRow.matricula
        },
        availability: userRow.lista_disponibilidades.map(
          (row) => {
            return {
              diaSemana: row.dia_semana,
              horaInicio: row.hora_inicio,
              horaFim: row.hora_fim
            }
          })
      }
    })
  }

  static toListAll(data: { userRows: UserListRow[] }): UserListAllResponseDTO {
    const { userRows } = data
    return userRows.map((row) => {
      return {
        user: {
          id: row.id,
          nome: row.nome,
          matricula: row.matricula,
          fotoUrl: row.foto_url,
          permAtendimento: row.perm_atendimento,
          permCadastro: row.perm_cadastro,
          ativo: row.ativo,
          createdAt: row.created_at
        }
      }
    })
  }
}
