<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class ExporterController extends Controller
{

    public function indexAction()
    {

        // $loggedUser = $this->get('security.context')->getToken()->getUser();
        $fileLoc = "lastExport.txt";
        if(!file_exists($fileLoc)) {
            file_put_contents($fileLoc, "1");
        }
        $lastItem = file_get_contents($fileLoc);
        return $this->render('JDACoreBundle:SeedExport:export.html.twig', array(
                    'page'=> 'export',
                    'lastItem' => $lastItem,
                ));
    }
}

