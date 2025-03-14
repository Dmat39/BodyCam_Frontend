// In ControlBody.jsx, make these changes to the structure:

return (
    <div className='flex flex-col w-full h-screen max-h-screen overflow-hidden'>
      {/* Header fixed at top */}
      <header className="text-white bg-green-700 py-4 px-3 mb-4 w-full rounded-lg flex justify-center relative flex-shrink-0">
        <Link onClick={() => navigate(-1)} className='flex items-center gap-1'>
          <ArrowBackIosNewRoundedIcon className='!size-5 md:!size-6 mt-[0.1rem] absolute left-4' />
        </Link>
        <h1 className="md:text-2xl lg:text-4xl font-bold text-center">Control de Bodycam</h1>
      </header>
      
      {/* Main content wrapper with fixed height and NO horizontal overflow */}
      <div className='flex-1 flex flex-col bg-white shadow rounded-lg p-4 overflow-hidden'>
        {/* Control bar fixed at top of content area */}
        <div className='flex flex-col md:flex-row justify-between pb-4 gap-3 flex-shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='text-gray-600'>
              Total de filas: <span id="rowCount" className='font-bold'>{count || 0}</span>
            </span>
          </div>
          <div className='flex items-center justify-end gap-3'>
            {/* Your control components here */}
          </div>
        </div>
        
        {/* Table container - this is where the scrolling should be isolated */}
        <div className='flex-1 relative overflow-hidden'>
          {loading && (
            <div className='absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10'>
              <div className='animate-pulse text-green-700 font-semibold'>Cargando...</div>
            </div>
          )}
          {!socketReady && !loading && (
            <div className='absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10'>
              <div className='text-amber-600 font-semibold'>Reconectando al servidor...</div>
            </div>
          )}
          <CRUDTable
            data={data}
            loading={loading}
            count={count}
            onEdit={handleEditMissing}
          />
        </div>
      </div>
  
      {/* Snackbar and Modal components */}
    </div>
  );