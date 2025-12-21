import { PrismaClient, GoalCategory, GoalPriority, GoalStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.reflection.deleteMany()
  await prisma.task.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('johndoe123', 10)
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@doe.com',
      password: hashedPassword,
    },
  })

  console.log('Usuário criado:', user.email)

  // Criar metas de exemplo para 2025
  const goals = await Promise.all([
    // Meta 1: Carreira
    prisma.goal.create({
      data: {
        title: 'Conseguir promoção para Senior',
        description: 'Desenvolver habilidades técnicas e de liderança para alcançar a posição de desenvolvedor senior na empresa.',
        category: GoalCategory.CARREIRA,
        priority: GoalPriority.ALTA,
        status: GoalStatus.EM_ANDAMENTO,
        deadline: new Date('2025-12-31'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Completar curso avançado de TypeScript', order: 0, completed: true },
            { title: 'Liderar 2 projetos importantes', order: 1, completed: false, deadline: new Date('2025-06-30') },
            { title: 'Mentorar 3 desenvolvedores júnior', order: 2, completed: false, deadline: new Date('2025-09-30') },
            { title: 'Apresentar em conferência técnica', order: 3, completed: false, deadline: new Date('2025-10-15') },
          ],
        },
      },
    }),
    // Meta 2: Saúde
    prisma.goal.create({
      data: {
        title: 'Correr minha primeira meia maratona',
        description: 'Treinar consistentemente e completar uma meia maratona (21km) em menos de 2 horas.',
        category: GoalCategory.SAUDE,
        priority: GoalPriority.ALTA,
        status: GoalStatus.EM_ANDAMENTO,
        deadline: new Date('2025-11-15'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Consultar médico para check-up', order: 0, completed: true },
            { title: 'Comprar tênis adequado para corrida', order: 1, completed: true },
            { title: 'Correr 5km sem parar', order: 2, completed: true },
            { title: 'Correr 10km sem parar', order: 3, completed: false, deadline: new Date('2025-05-01') },
            { title: 'Correr 15km sem parar', order: 4, completed: false, deadline: new Date('2025-08-01') },
            { title: 'Fazer corrida de 21km', order: 5, completed: false, deadline: new Date('2025-11-15') },
          ],
        },
        reflections: {
          create: [
            {
              whatWorked: 'Criar uma rotina de treino pela manhã funciona melhor para mim. O aplicativo de acompanhamento me mantém motivado.',
              whatDidntWork: 'Treinar depois do trabalho não funciona - sempre estou muito cansado e acabo pulando.',
            },
          ],
        },
      },
    }),
    // Meta 3: Finanças
    prisma.goal.create({
      data: {
        title: 'Economizar R$ 50.000 para reserva de emergência',
        description: 'Construir uma reserva financeira sólida equivalente a 6 meses de despesas.',
        category: GoalCategory.FINANCAS,
        priority: GoalPriority.ALTA,
        status: GoalStatus.EM_ANDAMENTO,
        deadline: new Date('2025-12-31'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Abrir conta em corretora', order: 0, completed: true },
            { title: 'Economizar R$ 10.000', order: 1, completed: true },
            { title: 'Economizar R$ 25.000', order: 2, completed: false, deadline: new Date('2025-06-30') },
            { title: 'Economizar R$ 40.000', order: 3, completed: false, deadline: new Date('2025-10-31') },
            { title: 'Atingir meta de R$ 50.000', order: 4, completed: false, deadline: new Date('2025-12-31') },
          ],
        },
      },
    }),
    // Meta 4: Estudos
    prisma.goal.create({
      data: {
        title: 'Aprender espanhol - nível intermediário',
        description: 'Estudar espanhol e alcançar fluência intermediária (B1) para viajar e trabalhar.',
        category: GoalCategory.ESTUDOS,
        priority: GoalPriority.MEDIA,
        status: GoalStatus.EM_ANDAMENTO,
        deadline: new Date('2025-12-15'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Comprar curso online de espanhol', order: 0, completed: true },
            { title: 'Completar módulo básico (A1)', order: 1, completed: false, deadline: new Date('2025-04-30') },
            { title: 'Completar módulo elementar (A2)', order: 2, completed: false, deadline: new Date('2025-08-31') },
            { title: 'Completar módulo intermediário (B1)', order: 3, completed: false, deadline: new Date('2025-12-15') },
            { title: 'Fazer certificação de proficiência', order: 4, completed: false, deadline: new Date('2025-12-20') },
          ],
        },
      },
    }),
    // Meta 5: Pessoal
    prisma.goal.create({
      data: {
        title: 'Ler 24 livros em 2025',
        description: 'Desenvolver o hábito de leitura lendo 2 livros por mês ao longo do ano.',
        category: GoalCategory.PESSOAL,
        priority: GoalPriority.MEDIA,
        status: GoalStatus.EM_ANDAMENTO,
        deadline: new Date('2025-12-31'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Criar lista de livros para 2025', order: 0, completed: true },
            { title: 'Ler 6 livros (Q1)', order: 1, completed: false, deadline: new Date('2025-03-31') },
            { title: 'Ler 12 livros (Q2)', order: 2, completed: false, deadline: new Date('2025-06-30') },
            { title: 'Ler 18 livros (Q3)', order: 3, completed: false, deadline: new Date('2025-09-30') },
            { title: 'Ler 24 livros (Q4)', order: 4, completed: false, deadline: new Date('2025-12-31') },
          ],
        },
      },
    }),
    // Meta 6: Concluída
    prisma.goal.create({
      data: {
        title: 'Organizar home office',
        description: 'Criar um espaço de trabalho produtivo e confortável em casa.',
        category: GoalCategory.PESSOAL,
        priority: GoalPriority.BAIXA,
        status: GoalStatus.CONCLUIDA,
        deadline: new Date('2025-02-28'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Comprar mesa ergonômica', order: 0, completed: true },
            { title: 'Comprar cadeira ergonômica', order: 1, completed: true },
            { title: 'Instalar iluminação adequada', order: 2, completed: true },
            { title: 'Organizar cabos e equipamentos', order: 3, completed: true },
          ],
        },
        reflections: {
          create: [
            {
              whatWorked: 'Investir em móveis de qualidade fez toda diferença no conforto. Pesquisar bastante antes de comprar.',
              whatDidntWork: 'Tentar economizar muito no início - acabei trocando itens baratos por melhores.',
            },
          ],
        },
      },
    }),
    // Meta 7: Pausada
    prisma.goal.create({
      data: {
        title: 'Aprender a tocar violão',
        description: 'Aprender o básico de violão para tocar minhas músicas favoritas.',
        category: GoalCategory.PESSOAL,
        priority: GoalPriority.BAIXA,
        status: GoalStatus.PAUSADA,
        deadline: new Date('2025-10-31'),
        userId: user.id,
        tasks: {
          create: [
            { title: 'Comprar violão', order: 0, completed: true },
            { title: 'Encontrar professor ou curso online', order: 1, completed: false },
            { title: 'Aprender acordes básicos', order: 2, completed: false },
            { title: 'Tocar primeira música completa', order: 3, completed: false },
          ],
        },
        reflections: {
          create: [
            {
              whatWorked: 'Comprar um violão de entrada mas com boa qualidade.',
              whatDidntWork: 'Não consegui tempo para praticar regularmente. Preciso repensar minha agenda.',
            },
          ],
        },
      },
    }),
  ])

  console.log(`${goals.length} metas criadas com sucesso!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
