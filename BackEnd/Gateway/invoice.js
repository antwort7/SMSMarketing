module.exports = data => /* html */`
<html>
	<head>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
		<style>
		.container{
			width:500px;
		}
		.invoice{
			border-top: 4px solid #E51943;
			padding:40px 0;
		}
		
		.invoice h1{
			margin-bottom:30px;
		}
		
		.invoice h2{
			font-weight: 800;
			text-transform: uppercase;
			font-size: 1.4rem;
			margin-bottom:0px;
		}

		.prev-info{
			line-height:6px;
		}
		
		.invoice .billingdetails-title{
			width:160px;
			font-weight: 800;
		}
		
		.invoice p, .invoice td{
			font-size:0.9rem;
		}
		
		.invoice th{
			font-weight: 800;
			font-size:0.9rem; 
		}
		.invoice .strong{
			font-weight: 800;
		}
		
		.invoice .total{
			font-weight: 800;
			font-size:1rem;
		}
		
		.invoice .total-price{
			font-size:1rem;
		}
		
		.table-invoices td{
			border-top: none;
			font-size:0.9rem;
		}
		
		.table-invoices td a{
			color: #E51943;
			text-decoration: underline;
		}
		
		.table-invoices .paid{
			color:#74C080;
		}
		
		.table-invoices .unpaid{
			color: #E51943;
			font-weight:bold;
		}
		</style>
	</head>
	<body>
		<div class="col-12 full-height invoice">
			<div class="container">
				<div class="row">
					<div class="col-12">
						<h2>Factura de Venta</h2>
					</div>
				</div>
				<div class="row">
					<h1 class="col-12">Actores en Línea</h1>
				</div>
				<div class="row">
					<div class="col-8">
						<p class="prev-info">Actores en Línea Nit: 900.877.941-4 . Régimen Común<br></br>
							Actividad Económica 6201 Tarifa 9,66 x 1.000<br></br>
							No Somos Grandes Contribuyentes- No Somos Autorretenedores.<br></br>
							Documento Oficial de Autorización Numeración de Facturación No 18762008610196<br></br>
							Fecha: 08/06/2018  Vigencia 24 meses. Numeración Autorizada: 1 al 2000</p>
					</div>
					<div class="col-4">
						<table class="table table-bordered">
							<tbody>
								<tr>
									<td class="strong">FACTURA Nº</td>
									<td>Z${data.invoice}</td>
								</tr>
								<tr>
									<td class="strong">FECHA</td>
									<td>${data.date}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<table class="table table-bordered">
							<tbody>
								<tr>
									<td class="billingdetails-title">CLIENTE:</td>
									<td colSpan="4">${data.billingData.fullName}</td>
								</tr>
								<tr>
									<td class="billingdetails-title">DIRECCIÓN:</td>
									<td colSpan="4">${data.billingData.address} - ${data.billingData.city}, ${data.billingData.country}</td>
								</tr>
								<tr>
									<td class="billingdetails-title">TELÉFONO:</td>
									<td colSpan="4">${data.billingData.phoneNumber}</td>
								</tr>
								<tr>
									<td class="billingdetails-title">NIT:</td>
									<td colSpan="4">${data.billingData.identification.type} ${data.billingData.identification.number}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<table class="table table-bordered">
							<thead>
								<tr>
									<th>DESCRIPCIÓN</th>
									<th>VALOR</th>
									<th>CANTIDAD</th>
									<th>TOTAL</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Suscripción ${data.plan}</td>
									<td>$${data.value}</td>
									<td>1</td>
									<td class="strong">$${data.value}</td>
								</tr>
								<tr>
									<td colSpan="2">Valor en Letras</td>
									<td class="strong">SUBTOTAL</td>
									<td class="strong">$${data.value}</td>
								</tr>
								<tr>
									<td rowSpan="3" colSpan="2">Son: pesos M/cte</td>
									<td>IVA 19%</td>
									<td class="strong">$0.00</td>
								</tr>
								<tr>
									<td>Otros</td>
									<td class="strong">$0.00</td>
								</tr>
								<tr>
									<td class="strong total">TOTAL</td>
									<td class="strong total-price">$${data.value}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<p>Por favor realizar transferencia a la cuenta de ahorros Nº 28347133029 de Bancolombia a nombre de Canned Head SAS. Factura impresa por computador.</p>
						<p><small>De conformidad con el Art. 772, 773, 774, 777, 778 y 779 del decreto 410/71 modificado por la le 1231/08 la presente factura de venta es título de valor negociable y se considera irrevocablemente aceptada por el comprador, si esta factura no es canceladadentro del plazo pactado se cobrará interés de mora a la tasa máxima legal vigente y autorizo para ser reportado ante centrales de riesgo.</small></p>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
`
