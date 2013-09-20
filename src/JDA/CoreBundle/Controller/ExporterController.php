<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class ExporterController extends Controller
{

    public function indexAction()
    {

        $loggedUser = $this->get('security.context')->getToken()->getUser();
        if(!is_object($loggedUser)){
            return $this->redirect('/web/login');
        }        
        $fileLoc = realpath("lastExport.txt");
        $lastExport = 0;
        if(file_exists($fileLoc)){
          $lastExport = file_get_contents($fileLoc);
        }
        return $this->render('JDACoreBundle:SeedExport:export.html.twig', array(
                    'page'=> 'export',
                    'lastExport' => $lastExport,
                ));
    }
    
	public function updateAction()
    {

        $loggedUser = $this->get('security.context')->getToken()->getUser();
        if(!is_object($loggedUser)){
            return $this->redirect('/web/login');
        }        
        $fileLoc = realpath("lastExport.txt");
        if(file_exists($fileLoc)) {
            file_put_contents($fileLoc, date('m/d/Y h:i:s a', time()));
        }
        
		return $this->render('JDACoreBundle:SeedExport:ok.html.twig', array(
                    'page'=> 'export',
                ));
    }

    public function getItemsAction()
    {
        $loggedUser = $this->get('security.context')->getToken()->getUser();
        if(!is_object($loggedUser)){
            return $this->redirect('/web/login');
        }
        $fileLoc = realpath("lastExport.txt");
        $lastExport = 0;
        if(file_exists($fileLoc)) {
          $lastExport = file_get_contents($fileLoc);
        }

        if($lastExport == 0) {
          return $this->render('JDACoreBundle:SeedExport:failure.html.twig', array(
                      'page'=> 'export failure'
                  ));
        }


        $em = $this->getDoctrine()->getEntityManager();
        $q = $em->createQuery("select i from ZeegaDataBundle:Item i where " .
          "i.published=1 and i.media_type='website' and i.user_id!=469 and i.id " .
          "> '" . $lastExport . "'")->setMaxResults(1000);
        $items = $q->getResult();

        // terrible way to do this, but whatever, it'll work
        $max = 0;
        foreach($items as $item) {
          if ($item->getId() > $max) {
            $max = $item->getId();
          }
        }
        
        if($max != 0) {
          file_put_contents($fileLoc, $max);
        }
        
        return $this->render('JDACoreBundle:SeedExport:items.html.twig', array(
                    'page'=> 'export',
                    'items'=> $items
                ));
    }

    public function getItemsSpecialAction()
    {
        $loggedUser = $this->get('security.context')->getToken()->getUser();
        if(!is_object($loggedUser)){
            return $this->redirect('/web/login');
        }
        $em = $this->getDoctrine()->getEntityManager();
        // this is a special export function to handle the stuff in the beginning
        $q = $em->createQuery("select i from ZeegaDataBundle:Item i where i.id >= 1475601 and i.id <= 1475855 and i.media_type='website'");
        $items = $q->getResult();

        
        return $this->render('JDACoreBundle:SeedExport:items.html.twig', array(
                    'page'=> 'export',
                    'items'=> $items
                ));
    }
}

