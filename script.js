const apiUrl = 'https://parseapi.back4app.com/classes/Funcionarios';
const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': 'rG7xmvaIxBDFC1oMcSYuCcCwrO0dyIPeDrPbC6YG', 
    'X-Parse-REST-API-Key': 'Q85oIMWwuuQvbXF2FoOa8ON3RcbFUJQUrTtvYafv'
};


const switchTrack = document.querySelector('.switch_track');
const body = document.body;


switchTrack.addEventListener('click', () => {
    
    const currentTheme = body.getAttribute('data-theme');
    
   
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
    }
});

let chart; 

async function criarFuncionario() {
    const nome = document.getElementById('nome').value;
    const sexo = document.getElementById('sexo').value;

    if (!nome || !sexo) {
        exibirMensagem('Por favor, preencha todos os campos!', 'erro');
        return;
    }

    const data = { nome, sexo };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            exibirMensagem('Funcionário criado com sucesso!', 'sucesso');
            buscarFuncionarios();
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (error) {
        exibirMensagem('Erro ao criar funcionário!', 'erro');
        console.error('Erro ao criar funcionário:', error);
    }
}

async function buscarFuncionarios() {
    try {
        const response = await fetch(apiUrl, { headers });
        const data = await response.json();

        if (response.ok) {
            displayEmployees(data.results);
            atualizarGrafico(data.results);
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    } catch (error) {
        exibirMensagem('Erro ao buscar dados!', 'erro');
        console.error('Erro ao buscar dados:', error);
    }
}

function displayEmployees(funcionarios) {
    const employeeList = document.getElementById('funcionarios');
    employeeList.innerHTML = ''; 

    funcionarios.forEach(func => {
        const nome = func.nome;
        const sexo = func.sexo;
        const objectId = func.objectId;

        if (nome && sexo) {
            const listItem = document.createElement('li');
            listItem.textContent = `Nome: ${nome}, Sexo: ${sexo}`;

           
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => editarFuncionario(objectId);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => excluirFuncionario(objectId);

            listItem.appendChild(editButton);
            listItem.appendChild(deleteButton);
            employeeList.appendChild(listItem);
        }
    });
}

async function editarFuncionario(id) {
    const nome = prompt('Digite o novo nome:');
    const sexo = prompt('Digite o novo sexo (Masculino ou Feminino):');

    if (!nome || !sexo) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const data = { nome, sexo };

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Funcionário editado com sucesso!');
            buscarFuncionarios();
        } else {
            const result = await response.json();
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (error) {
        alert('Erro ao editar funcionário!');
        console.error('Erro ao editar funcionário:', error);
    }
}

async function excluirFuncionario(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers
        });

        if (response.ok) {
            alert('Funcionário excluído com sucesso!');
            buscarFuncionarios();
        } else {
            const result = await response.json();
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (error) {
        alert('Erro ao excluir funcionário!');
        console.error('Erro ao excluir funcionário:', error);
    }
}

function atualizarGrafico(funcionarios) {
    const contagemSexo = funcionarios.reduce((acc, func) => {
        acc[func.sexo] = (acc[func.sexo] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(contagemSexo);
    const data = Object.values(contagemSexo);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    } else {
        const ctx = document.getElementById('grafico1').getContext('2d');
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distribuição por Gênero',
                    data: data,
                    backgroundColor: ['#36a2eb', '#ff6384'], 
                    borderColor: ['#ffffff', '#ffffff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });
    }
}

function exibirMensagem(mensagem, tipo) {
    const mensagemElemento = document.createElement('div');
    mensagemElemento.className = `mensagem ${tipo}`;
    mensagemElemento.innerText = mensagem;
    document.body.appendChild(mensagemElemento);
    setTimeout(() => mensagemElemento.remove(), 3000); 
}


async function mostrarPerfil() {
    const resposta = await fetch('https://randomuser.me/api/');
    const dados = await resposta.json();
    
    const usuario = dados.results[0];
    

    document.getElementById('perfil-img').src = usuario.picture.large;
    document.getElementById('nome').textContent = `Nome: ${usuario.name.first} ${usuario.name.last}`;
    document.getElementById('cargo').textContent = `Cargo: ${usuario.dob.age} anos (trabalho: Porto Digital)`;
    document.getElementById('email').textContent = `E-mail: ${usuario.email}`;
    
   
    document.getElementById('perfil-container').style.display = 'block';
}


mostrarPerfil();


buscarFuncionarios();
