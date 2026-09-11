DOCUMENTO DE ESCOPO

1. IDENTIFICAÇÃO DO PROJETO

Nome do projeto: Sistema Web para Clínica Odontológica

Tipo de projeto: Sistema web

Área: Saúde / Odontologia

Desenvolvimento: Projeto de TCC

Tecnologias previstas: HTML, CSS, JavaScript e tecnologias de banco de dados e autenticação.

2. DESCRIÇÃO DO PROJETO

O projeto consiste no desenvolvimento de um sistema web para uma clínica odontológica, com o objetivo de facilitar o contato entre pacientes e a clínica, permitindo que os usuários conheçam os serviços oferecidos, realizem seu cadastro e login e solicitem o agendamento de consultas.

O sistema também contará com uma área administrativa destinada ao responsável pela clínica, permitindo o gerenciamento das informações relacionadas aos agendamentos e aos usuários.

O agendamento será integrado ao WhatsApp da clínica. Após o preenchimento das informações necessárias, o paciente será direcionado para uma conversa no WhatsApp, onde poderá confirmar os detalhes do atendimento diretamente com a clínica.

3. OBJETIVO GERAL

Desenvolver um sistema web profissional para uma clínica odontológica, proporcionando aos pacientes uma maneira simples e organizada de conhecer os serviços da clínica, realizar seu cadastro, solicitar consultas e entrar em contato pelo WhatsApp.

Além disso, o sistema terá um painel administrativo para facilitar o gerenciamento dos agendamentos e das informações do sistema.

4. OBJETIVOS ESPECÍFICOS

* Desenvolver uma página inicial profissional para a clínica.
* Apresentar os principais serviços odontológicos oferecidos.
* Disponibilizar informações sobre a clínica e sua equipe.
* Permitir que pacientes realizem cadastro no sistema.
* Permitir que usuários cadastrados realizem login.
* Desenvolver uma área destinada ao paciente.
* Criar um formulário para solicitação de agendamento.
* Integrar o agendamento ao WhatsApp da clínica.
* Desenvolver um painel administrativo.
* Permitir ao administrador visualizar e gerenciar os agendamentos.
* Organizar as informações dos pacientes e consultas.
* Criar uma interface responsiva para computadores, tablets e celulares.

5. PÚBLICO-ALVO

O sistema terá dois principais tipos de usuários:

5.1 Paciente

Pessoa que deseja conhecer os serviços da clínica, realizar cadastro, acessar sua conta e solicitar o agendamento de uma consulta.

5.2 Administrador

Responsável pela administração do sistema e pelo gerenciamento das informações da clínica, pacientes e solicitações de agendamento.

6. FUNCIONALIDADES DO SISTEMA

6.1 Página Inicial

A página inicial apresentará:

* Nome e identidade visual da clínica.
* Apresentação da clínica.
* Principais serviços.
* Informações sobre atendimento.
* Botão de contato.
* Botão para agendamento.
* Acesso ao login e cadastro.
* Informações de contato e localização.

6.2 Cadastro

O paciente poderá criar uma conta informando os dados necessários para utilização do sistema.

O cadastro permitirá que o sistema identifique o usuário e associe suas solicitações de atendimento à sua conta.

6.3 Login

O usuário cadastrado poderá realizar login para acessar as funcionalidades destinadas aos pacientes.

O sistema deverá realizar a autenticação dos usuários e impedir que áreas restritas sejam acessadas sem autorização.

6.4 Agendamento de Consulta

O paciente poderá preencher um formulário com informações relacionadas ao atendimento, como:

* Nome.
* Serviço desejado.
* Data desejada.
* Horário desejado.
* Telefone.
* Observações, quando necessário.

Após o preenchimento, o sistema deverá direcionar o paciente para o WhatsApp da clínica, levando as informações preenchidas para facilitar o contato e a confirmação do atendimento.

6.5 Integração com WhatsApp

O sistema contará com integração por meio de um botão ou link para o WhatsApp da clínica.

As informações preenchidas no formulário de agendamento poderão ser enviadas automaticamente em uma mensagem, facilitando a comunicação entre paciente e clínica.

6.6 Área do Paciente

Após realizar login, o paciente poderá acessar uma área restrita contendo suas informações e suas solicitações de atendimento.

O sistema poderá apresentar informações como:

* Dados cadastrados.
* Solicitações de agendamento.
* Data e horário solicitados.
* Serviço escolhido.
* Status da solicitação.

6.7 Painel Administrativo

O administrador terá acesso a uma área restrita do sistema.

O painel administrativo deverá permitir:

* Visualizar pacientes cadastrados.
* Visualizar solicitações de agendamento.
* Consultar informações dos atendimentos.
* Alterar o status das solicitações.
* Gerenciar informações necessárias para o funcionamento do sistema.
* Acessar informações gerais da clínica.

6.8 Controle de Acesso

O sistema deverá possuir diferentes níveis de acesso.

O paciente terá acesso somente às funcionalidades destinadas a ele, enquanto o administrador terá acesso ao painel administrativo.

7. REQUISITOS FUNCIONAIS

RF01 - O sistema deverá permitir o cadastro de pacientes.

RF02 - O sistema deverá permitir que pacientes cadastrados realizem login.

RF03 - O sistema deverá permitir o logout do usuário.

RF04 - O sistema deverá permitir o preenchimento de um formulário de solicitação de consulta.

RF05 - O sistema deverá registrar as informações da solicitação de atendimento.

RF06 - O sistema deverá disponibilizar um botão para contato via WhatsApp.

RF07 - O sistema deverá direcionar o paciente para o WhatsApp após a solicitação de agendamento.

RF08 - O sistema deverá permitir que o paciente consulte suas solicitações.

RF09 - O sistema deverá possuir uma área exclusiva para o administrador.

RF10 - O administrador deverá conseguir visualizar os agendamentos solicitados.

RF11 - O administrador deverá conseguir alterar o status de uma solicitação.

RF12 - O sistema deverá impedir o acesso de pacientes ao painel administrativo.

8. REQUISITOS NÃO FUNCIONAIS

RNF01 - Responsividade: O sistema deverá funcionar adequadamente em computadores, tablets e smartphones.

RNF02 - Usabilidade: A interface deverá ser simples e intuitiva para facilitar a utilização pelos pacientes.

RNF03 - Segurança: As informações dos usuários deverão possuir controle de acesso adequado.

RNF04 - Desempenho: As páginas deverão carregar de maneira rápida e eficiente.

RNF05 - Compatibilidade: O sistema deverá funcionar nos principais navegadores modernos.

RNF06 - Manutenção: O código deverá ser organizado para facilitar futuras alterações e melhorias.

RNF07 - Privacidade: Os dados dos pacientes deverão ser tratados de forma adequada, considerando princípios de proteção e segurança de dados.

9. REGRAS DE NEGÓCIO

RN01 - Apenas usuários cadastrados poderão acessar as funcionalidades restritas aos pacientes.

RN02 - O administrador deverá possuir acesso exclusivo ao painel administrativo.

RN03 - Um paciente não poderá acessar informações de outro paciente.

RN04 - O agendamento realizado pelo paciente será considerado uma solicitação até que seja confirmado pela clínica.

RN05 - A confirmação do atendimento poderá ser realizada diretamente pela clínica por meio do WhatsApp.

RN06 - O administrador poderá atualizar o status das solicitações de atendimento.

10. ESCOPO DO PROJETO

Incluído no projeto:

* Site institucional da clínica.
* Página de serviços.
* Cadastro de pacientes.
* Login e autenticação.
* Área do paciente.
* Formulário de agendamento.
* Integração com WhatsApp.
* Banco de dados.
* Painel administrativo.
* Gerenciamento de solicitações.
* Controle de acesso.
* Design responsivo.

Não incluído inicialmente:

* Pagamento online.
* Teleconsulta.
* Prontuário odontológico completo.
* Emissão de receitas.
* Integração com convênios.
* Sistema completo de estoque.
* Sistema financeiro da clínica.

Essas funcionalidades poderão ser consideradas em futuras versões do sistema.

11. PERFIS DE USUÁRIO

Perfil: Visitante

Permissões: Visualizar o site, serviços e informações da clínica.

Perfil: Paciente

Permissões: Fazer login, solicitar consultas e visualizar suas solicitações.

Perfil: Administrador

Permissões: Gerenciar pacientes, solicitações e informações administrativas.

12. FLUXO PRINCIPAL DO PACIENTE

13. O visitante acessa o site da clínica.

14. Visualiza os serviços e informações disponíveis.

15. Escolhe a opção de agendamento.

16. Caso necessário, realiza cadastro ou login.

17. Preenche os dados da consulta.

18. O sistema registra a solicitação.

19. O paciente é direcionado ao WhatsApp da clínica.

20. A clínica recebe as informações e realiza a confirmação do atendimento.

21. O administrador poderá atualizar o status da solicitação no painel.

22. FLUXO PRINCIPAL DO ADMINISTRADOR

23. O administrador acessa a página de login.

24. Realiza a autenticação.

25. O sistema verifica suas permissões.

26. O administrador acessa o painel administrativo.

27. Visualiza as solicitações de consultas.

28. Consulta as informações necessárias.

29. Atualiza o status dos atendimentos.

30. As informações atualizadas ficam disponíveis para consulta do paciente, quando aplicável.

31. RESULTADO ESPERADO

Ao final do projeto, espera-se obter um sistema web funcional e responsivo para uma clínica odontológica, capaz de facilitar o contato entre pacientes e clínica, organizar as solicitações de consultas e fornecer ao administrador uma ferramenta para gerenciamento dos atendimentos.

O sistema deverá apresentar uma interface profissional, possuir controle de acesso e integrar o processo de solicitação de consultas ao WhatsApp, tornando o atendimento mais prático e organizado.
